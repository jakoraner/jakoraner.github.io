window.onload = function() {
    // Get the canvas and WebGL context
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert('WebGL is not available');
        return;
    }

    // Define the vertices of a unit cube 
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0)
    ];

    // Indices for drawing the cube
    var indices = [
        1, 0, 3, 1, 3, 2, // Front face
        2, 3, 7, 2, 7, 6, // Right face
        3, 0, 4, 3, 4, 7, // Bottom face
        6, 5, 1, 6, 1, 2, // Top face
        4, 5, 6, 4, 6, 7, // Back face
        5, 4, 0, 5, 0, 1  // Left face
    ];

    // Initialize shaders
    var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    // Load the data into GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with data buffer
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create index buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // Uniform locations
    var uModelViewMatrixLoc = gl.getUniformLocation(program, 'uModelViewMatrix');
    var uProjectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
    var uColorLoc = gl.getUniformLocation(program, 'uColor');

    // Set up projection matrix
    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(60, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(uProjectionMatrixLoc, false, flatten(projectionMatrix));

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    // Initialize transformation matrices
    var modelViewMatrix = mat4();

    // Variables for aileron rotation
    var aileronAngle = 0;

    // Event listeners for buttons
    document.getElementById('roll-left').onclick = function() {
        aileronAngle += 5;
    };
    document.getElementById('roll-right').onclick = function() {
        aileronAngle -= 5;
    };

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up the camera
        var eye = vec3(0.0, 5.0, 15.0);
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);

        modelViewMatrix = lookAt(eye, at, up);

        // Draw the aircraft
        drawAircraft();

        requestAnimationFrame(render);
    }

    function drawAircraft() {
        // Save the current modelViewMatrix
        var mvStack = [];

        // BODY
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale4(1.0, 1.0, 5.0));
        setColor(vec4(0.7, 0.7, 0.7, 1.0)); // Gray color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // WINGS
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale4(10.0, 0.2, 1.0));
        setColor(vec4(0.3, 0.3, 0.8, 1.0)); // Blue color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // LEFT AILERON
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(-5.5, 0.0, -0.5));
        modelViewMatrix = mult(modelViewMatrix, rotate(aileronAngle, [0, 0, 1]));
        modelViewMatrix = mult(modelViewMatrix, translate(-0.5, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale4(1.0, 0.1, 1.0));
        setColor(vec4(0.8, 0.3, 0.3, 1.0)); // Red color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // RIGHT AILERON
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(5.5, 0.0, -0.5));
        modelViewMatrix = mult(modelViewMatrix, rotate(-aileronAngle, [0, 0, 1]));
        modelViewMatrix = mult(modelViewMatrix, translate(0.5, 0.0, 0.0));
        modelViewMatrix = mult(modelViewMatrix, scale4(1.0, 0.1, 1.0));
        setColor(vec4(0.8, 0.3, 0.3, 1.0)); // Red color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // VERTICAL STABILIZER
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 1.0, -2.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.2, 2.0, 1.0));
        setColor(vec4(0.3, 0.8, 0.3, 1.0)); // Green color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // HORIZONTAL STABILIZER
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.0, -3.0));
        modelViewMatrix = mult(modelViewMatrix, scale4(4.0, 0.2, 1.0));
        setColor(vec4(0.3, 0.8, 0.8, 1.0)); // Cyan color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // ELEVATORS (Optional)
        // Left Elevator
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(-2.0, 0.0, -3.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(1.0, 0.1, 1.0));
        setColor(vec4(0.8, 0.8, 0.3, 1.0)); // Yellow color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // Right Elevator
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(2.0, 0.0, -3.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(1.0, 0.1, 1.0));
        setColor(vec4(0.8, 0.8, 0.3, 1.0)); // Yellow color
        drawCube();
        modelViewMatrix = mvStack.pop();

        // RUDDER (Optional)
        mvStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 2.0, -2.5));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.1, 1.0, 0.5));
        setColor(vec4(0.8, 0.5, 0.2, 1.0)); // Orange color
        drawCube();
        modelViewMatrix = mvStack.pop();
    }

    function drawCube() {
        gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    }

    function setColor(color) {
        gl.uniform4fv(uColorLoc, flatten(color));
    }

    function scale4(a, b, c) {
        var result = mat4();
        result[0][0] = a;
        result[1][1] = b;
        result[2][2] = c;
        return result;
    }

    render();
};