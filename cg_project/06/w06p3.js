window.onload = function() {
    // Get the canvas element
    var canvas = document.getElementById("gl-canvas");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Helper function to compute the normal matrix
    function normalMatrix3(modelViewMatrix) {
        var upperLeft3x3 = mat3(
            vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
            vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
            vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
        );

        var inverseTranspose = inverse(transpose(upperLeft3x3));
        return inverseTranspose;
    }

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

    // Load the Earth texture
    var texture = gl.createTexture();
    var image = new Image();
    image.onload = function() {
        configureTexture(image);
        render(); // Start rendering after the texture has been loaded
    };
    image.src = "earth.jpg"; // Ensure earth.jpg is in the same directory

    function configureTexture(image) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Do not flip the image Y-axis
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            gl.RGBA, gl.UNSIGNED_BYTE, image);
    
        // Generate mipmaps
        gl.generateMipmap(gl.TEXTURE_2D);
    
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        // Set wrapping mode
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // Use REPEAT for S coordinate
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    // Uniform locations
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    var normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");

    // Set up projection matrix
    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(45.0, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set up lighting with further increased brightness
    var ambientLight = vec4(0.8, 0.8, 0.8, 1.0); // Further increase ambient light
    var diffuseLight = vec4(1.5, 1.5, 1.5, 1.0); // Further increase diffuse light

    gl.uniform4fv(ambientProductLoc, flatten(ambientLight));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseLight));

    // Variables for camera orbiting
    var orbiting = true;
    var radius = 5.0;
    var alpha = 0.0;
    var deltaAlpha = 0.02; // Adjust orbiting speed as desired

    function render() {
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

        var modelViewMatrix = lookAt(eye, at, up);

        // Rotate the sphere by 180 degrees around Y-axis
        var rotationMatrix = rotateY(0);
        modelViewMatrix = mult(modelViewMatrix, rotationMatrix);

        var normalMatrix = normalMatrix3(modelViewMatrix);

        // Pass matrices to the shader
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

        // Update the light direction in eye space (from the camera's perspective)
        var lightDirection = vec3(0.0, 0.0, -1.0);
        gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));

        // Activate texture unit and bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Get the toggle orbit button
    var toggleOrbitButton = document.getElementById("toggle-orbit");

    // Event listener for toggling orbiting
    toggleOrbitButton.addEventListener("click", function() {
        orbiting = !orbiting;
        toggleOrbitButton.textContent = orbiting ? "Stop Orbiting" : "Start Orbiting";
    });
};