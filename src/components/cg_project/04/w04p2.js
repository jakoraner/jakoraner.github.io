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
    // Flipped the z-coordinate to correct winding if necessary
    var va = vec4(0.0, 0.0, 1.0, 1.0);
    var vb = vec4(0.0, 0.942809, -0.333333, 1.0);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1.0);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1.0);

    // Shader program and locations
    var program;
    var aPositionLoc;
    var uModelViewMatrixLoc;
    var uProjectionMatrixLoc;

    // Matrices
    var projectionMatrix;
    var modelViewMatrix;

    // Buffers
    var vBuffer;

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
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

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

        // Create buffer
        vBuffer = gl.createBuffer();

        // Set up the projection matrix
        initProjectionMatrix();

        // Initialize sphere geometry
        initSphere();

        // Setup event listeners for buttons
        setupButtons();

        // Start rendering
        render();
    }

    // Set up projection matrix
    function initProjectionMatrix() {
        var aspect = canvas.width / canvas.height;
        projectionMatrix = perspective(45.0, aspect, 0.1, 100.0);
    }

    // Render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up the camera
        var eye = vec3(0.0, 0.0, 4.0); // Adjusted to ensure the sphere fits
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);

        modelViewMatrix = lookAt(eye, at, up);

        // Apply rotation
        var rotationAngle = performance.now() / 1000 * 30; // Rotate 30 degrees per second
        modelViewMatrix = mult(modelViewMatrix, rotateY(rotationAngle));

        // Set the uniforms
        gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(uProjectionMatrixLoc, false, flatten(projectionMatrix));

        // Enable the attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(aPositionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPositionLoc);

        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Setup event listeners for subdivision buttons
    function setupButtons() {
        var incButton = document.getElementById('increase-subdivision');
        var decButton = document.getElementById('decrease-subdivision');

        incButton.addEventListener('click', function() {
            if (NumTimesToSubdivide < 8) { // Limit to prevent excessive subdivisions
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
    }

    // Initialize everything
    init();
};