window.onload = function() {
    // Get the canvas element
    var canvas = document.getElementById('gl');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL is not supported in this browser.');
        alert('WebGL is not supported in this browser.');
        return;
    }

    // Define the vertices of the cube
    var vertices = [
        vec3(0.0, 0.0, 0.0), // v0
        vec3(1.0, 0.0, 0.0), // v1
        vec3(1.0, 1.0, 0.0), // v2
        vec3(0.0, 1.0, 0.0), // v3
        vec3(0.0, 0.0, 1.0), // v4
        vec3(1.0, 0.0, 1.0), // v5
        vec3(1.0, 1.0, 1.0), // v6
        vec3(0.0, 1.0, 1.0)  // v7
    ];

    // Define the indices for the wireframe of the cube
    var wireIndices = new Uint16Array([
        0, 1, 1, 2, 2, 3, 3, 0, // Bottom face
        4, 5, 5, 6, 6, 7, 7, 4, // Top face
        0, 4, 1, 5, 2, 6, 3, 7  // Sides
    ]);

    // Create and compile shaders
    var vertexShaderSource = document.getElementById('vertex-shader').text;
    var fragmentShaderSource = document.getElementById('fragment-shader').text;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the vertex shader:\n' + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the fragment shader:\n' + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return;
    }

    // Link the shaders into a program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:\n' + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return;
    }

    // Use the shader program
    gl.useProgram(shaderProgram);

    // Get attribute and uniform locations
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    var modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

    // Create buffers and upload data
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireIndices, gl.STATIC_DRAW);

    // Set up the vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas and set the viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0); // Cornflower blue

    // Compute aspect ratio
    var aspect = canvas.width / canvas.height;

    // Create the projection matrix (Perspective Projection with 45-degree FOV)
    var projectionMatrix = perspective(45, aspect, 0.1, 100.0);

    // Set the projection matrix uniform
    gl.uniformMatrix4fv(projectionMatrixLocation, false, flatten(projectionMatrix));

    // Function to draw a cube with a given model-view matrix
    function drawCube(modelViewMatrix) {
        gl.uniformMatrix4fv(modelViewMatrixLocation, false, flatten(modelViewMatrix));
        gl.drawElements(gl.LINES, wireIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    // Prepare to draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Positions to separate the cubes in space
    var cubePositions = [
        vec3(-1.75, 0.0, -7.0), // Left cube
        vec3(0.0, 0.0, -7.0),   // Center cube
        vec3(1.75, 0.0, -7.0)   // Right cube
    ];

    // Base model-view matrix
    var baseModelViewMatrix = mat4();

    // Transformation matrices
    /**
     * Transformation Matrices Used:
     *
     * - Translation to Origin (Centering the Cube):
     *   T_origin = translate(-0.5, -0.5, -0.5)
     *
     * - Rotation around X-axis by angle θ:
     *   R_x(θ) = rotate(θ, [1, 0, 0])
     *
     * - Rotation around Y-axis by angle θ:
     *   R_y(θ) = rotate(θ, [0, 1, 0])
     *
     * - Rotation around Z-axis by angle θ:
     *   R_z(θ) = rotate(θ, [0, 0, 1])
     *
     * - Translation to Cube Position:
     *   T_pos = translate(x, y, z)
     */

    // Center the cube at the origin
    var translateToOrigin = translate(-0.5, -0.5, -0.5);

    // First Cube: One-point perspective (front view)
    /**
     * For the First Cube:
     * CTM = T_pos * T_origin
     * Where:
     * - T_pos = translate(cubePositions[0])
     * - T_origin = translate(-0.5, -0.5, -0.5)
     */
    var mvMatrix1 = mult(translate(cubePositions[0]), baseModelViewMatrix);
    mvMatrix1 = mult(mvMatrix1, translateToOrigin);
    drawCube(mvMatrix1);

    // Second Cube: Two-point perspective (rotated around Y-axis)
    /**
     * For the Second Cube:
     * CTM = T_pos * R_y(45°) * T_origin
     * Where:
     * - T_pos = translate(cubePositions[1])
     * - R_y(45°) = rotate(45, [0, 1, 0])
     * - T_origin = translate(-0.5, -0.5, -0.5)
     */
    var mvMatrix2 = mult(translate(cubePositions[1]), baseModelViewMatrix);
    mvMatrix2 = mult(mvMatrix2, rotate(45, [0, 1, 0]));
    mvMatrix2 = mult(mvMatrix2, translateToOrigin);
    drawCube(mvMatrix2);

    // Third Cube: Three-point perspective (rotated around X, Y, and Z axes)
    /**
     * For the Third Cube:
     * CTM = T_pos * R_z(30°) * R_y(30°) * R_x(30°) * T_origin
     * Where:
     * - T_pos = translate(cubePositions[2])
     * - R_z(30°) = rotate(30, [0, 0, 1])
     * - R_y(30°) = rotate(30, [0, 1, 0])
     * - R_x(30°) = rotate(30, [1, 0, 0])
     * - T_origin = translate(-0.5, -0.5, -0.5)
     *
     * Note: The order of rotations is R_z * R_y * R_x, applied in that sequence.
     */
    var mvMatrix3 = mult(translate(cubePositions[2]), baseModelViewMatrix);
    mvMatrix3 = mult(mvMatrix3, rotate(30, [0, 0, 1])); // R_z(30°)
    mvMatrix3 = mult(mvMatrix3, rotate(30, [0, 1, 0])); // R_y(30°)
    mvMatrix3 = mult(mvMatrix3, rotate(30, [1, 0, 0])); // R_x(30°)
    mvMatrix3 = mult(mvMatrix3, translateToOrigin);
    drawCube(mvMatrix3);
};