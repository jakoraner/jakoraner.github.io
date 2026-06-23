window.onload = function() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Helper function to compute the normal matrix (not needed in this case)

    // Sphere parameters
    var numTimesToSubdivide = 5; // Adjust for smoother sphere
    var index = 0;
    var pointsArray = [];
    var normalsArray = [];

    // Create the sphere geometry
    function triangle(a, b, c) {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

        // Normals are the same as the positions for a unit sphere
        normalsArray.push(vec3(a));
        normalsArray.push(vec3(b));
        normalsArray.push(vec3(c));

        index += 3;
    }

    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(a, c, d, n);
        divideTriangle(a, d, b, n);
        divideTriangle(b, c, d, n);
    }

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    // Generate the sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.program = program; // Set the program for uniform setting

    // Load the vertex data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // Associate vertex data with shader variables
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the normal data into the GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    // Associate normal data with shader variables
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Initialize the cube map texture
    initTexture(gl);

    // Uniform locations
    var modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // Set up projection matrix
    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(45.0, aspect, 0.1, 100.0);

    // Variables for camera orbiting
    var orbiting = true;
    var radius = 5.0;
    var alpha = 0.0;
    var deltaAlpha = 0.02; // Adjust orbiting speed as desired

    function render() {
        if (g_tex_ready < 6) {
            requestAnimationFrame(render);
            return; // Wait until all textures are loaded
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Update camera position if orbiting
        if (orbiting) {
            alpha += deltaAlpha;
            if (alpha > 2 * Math.PI) alpha -= 2 * Math.PI;
        }

        // Compute eye position
        var eye = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);

        // Model matrix (rotation only)
        var modelMatrix = rotateY(180); // Rotate sphere by 180 degrees around Y-axis

        // View matrix
        var viewMatrix = lookAt(eye, at, up);

        // Model-View matrix
        var modelViewMatrix = mult(viewMatrix, modelMatrix);

        // Pass matrices to the shader
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // Activate texture unit and bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Cube map texture initialization function
    var g_tex_ready = 0;
    var texture;
    function initTexture(gl) {
        var cubemap = [
            'textures/cm_left.png',   // POSITIVE_X
            'textures/cm_right.png',  // NEGATIVE_X
            'textures/cm_top.png',    // POSITIVE_Y
            'textures/cm_bottom.png', // NEGATIVE_Y
            'textures/cm_back.png',   // POSITIVE_Z
            'textures/cm_front.png'   // NEGATIVE_Z
        ];
        gl.activeTexture(gl.TEXTURE0);
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        for (var i = 0; i < 6; ++i) {
            var image = document.createElement('img');
            image.crossOrigin = 'anonymous';
            image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            image.onload = function(event) {
                var image = event.target;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                ++g_tex_ready;
                if (g_tex_ready === 6) {
                    render(); // Start rendering after all six images are loaded
                }
            };
            image.src = cubemap[i];
        }
        // Set the samplerCube uniform variable
        var texMapLoc = gl.getUniformLocation(gl.program, "texMap");
        gl.uniform1i(texMapLoc, 0); // Texture unit 0
    }

    // Get the toggle orbit button
    var toggleOrbitButton = document.getElementById("toggle-orbit");

    // Event listener for toggling orbiting
    toggleOrbitButton.addEventListener("click", function() {
        orbiting = !orbiting;
        toggleOrbitButton.textContent = orbiting ? "Stop Orbiting" : "Start Orbiting";
    });
};