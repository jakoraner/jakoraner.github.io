window.onload = function() {
    // Get the canvas and WebGL context
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert('WebGL is not available');
        return;
    }

    // Variables for subdivision
    var NumTimesToSubdivide = 3; // Initial subdivision level
    var pointsArray = [];

    // Define the vertices of a tetrahedron (points on the unit sphere)
    // Flipping the z-coordinate to define front faces correctly
    var va = vec4(0.0, 0.0, 1.0, 1.0);
    var vb = vec4(0.0, 0.942809, -0.333333, 1.0);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1.0);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1.0);

    // Shader program and locations
    var program;
    var aPositionLoc;
    var uModelViewMatrixLoc;
    var uProjectionMatrixLoc;
    var uKdLoc;
    var uLeLoc;
    var uLightDirLoc;

    // Matrices
    var projectionMatrix;
    var modelViewMatrix;

    // Buffers
    var vBuffer;

    // Lighting parameters
    var kd = vec3(1.0, 0.0, 0.0);        // Diffuse reflection coefficient (red)
    var Le = vec3(1.0, 1.0, 1.0);        // Light emission (white)
    var lightDir = vec3(0.0, 0.0, -1.0);  // Light direction

    // Camera orbiting parameters
    var orbiting = false;
    var radius = 4.0;
    var alpha = 0.0;
    var deltaAlpha = 0.02; // radians per frame

    // Initialize the sphere geometry
    function initSphere() {
        pointsArray = [];
        tetrahedron(va, vb, vc, vd, NumTimesToSubdivide);

        // Load the data into GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    }

    // Recursive subdivision of triangles
    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(a, c, d, n);
        divideTriangle(a, d, b, n);
        divideTriangle(b, c, d, n);
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

    function triangle(a, b, c) {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
    }

    // Initialize WebGL
    function init() {
        // Set viewport and clear color
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.392, 0.584, 0.929, 1.0); // Cornflower blue

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);

        // Enable back-face culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK); // Cull back faces
        gl.frontFace(gl.CCW); // Define front faces as counter-clockwise

        // Initialize shaders
        program = initShaders(gl, 'vertex-shader', 'fragment-shader');
        gl.useProgram(program);

        // Get attribute and uniform locations
        aPositionLoc = gl.getAttribLocation(program, 'aPosition');
        uModelViewMatrixLoc = gl.getUniformLocation(program, 'uModelViewMatrix');
        uProjectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
        uKdLoc = gl.getUniformLocation(program, 'uKd');
        uLeLoc = gl.getUniformLocation(program, 'uLe');
        uLightDirLoc = gl.getUniformLocation(program, 'uLightDir');

        // Create buffer
        vBuffer = gl.createBuffer();

        // Set up the projection matrix
        initProjectionMatrix();

        // Initialize sphere geometry
        initSphere();

        // Set lighting uniforms
        gl.uniform3fv(uKdLoc, flatten(kd));        // Set kd to red
        gl.uniform3fv(uLeLoc, flatten(Le));        // Set Le to white
        gl.uniform3fv(uLightDirLoc, flatten(lightDir)); // Set light direction

        // Setup buttons
        setupButtons();

        // Start rendering
        render();
    }

    // Set up projection matrix
    function initProjectionMatrix() {
        var aspect = canvas.width / canvas.height;
        projectionMatrix = perspective(45.0, aspect, 0.1, 100.0);
        gl.uniformMatrix4fv(uProjectionMatrixLoc, false, flatten(projectionMatrix));
    }

    // Render function
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

        // Compute modelViewMatrix with lookAt
        modelViewMatrix = lookAt(eye, at, up);

        // Set the uniforms
        gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(modelViewMatrix));

        // Enable the attribute and set pointer
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(aPositionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPositionLoc);

        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Setup event listeners for buttons
    function setupButtons() {
        var incButton = document.getElementById('increase-subdivision');
        var decButton = document.getElementById('decrease-subdivision');
        var toggleOrbitButton = document.getElementById('toggle-orbit');

        incButton.addEventListener('click', function() {
            if (NumTimesToSubdivide < 8) { // Limit subdivision level
                NumTimesToSubdivide++;
                initSphere();
            }
        });

        decButton.addEventListener('click', function() {
            if (NumTimesToSubdivide > 0) { // Prevent negative subdivisions
                NumTimesToSubdivide--;
                initSphere();
            }
        });

        toggleOrbitButton.addEventListener('click', function() {
            orbiting = !orbiting;
            toggleOrbitButton.textContent = orbiting ? 'Stop Orbiting' : 'Start Orbiting';
        });
    }

    // Initialize everything
    init();
};