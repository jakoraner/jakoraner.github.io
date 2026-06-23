window.onload = function init() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Initialize variables
    var points = [];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0); // Cornflower blue

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get attribute location
    var vPosition = gl.getAttribLocation(program, "vPosition");

    // Create buffer
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Event listener for mouse click
    canvas.addEventListener("click", function(event) {
        // Get the bounding rectangle of the canvas
        var rect = canvas.getBoundingClientRect();

        // Calculate mouse position in canvas coordinate system
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Convert to WebGL's clip space coordinates (-1 to 1)
        x = (2 * x) / canvas.width - 1;
        y = 1 - (2 * y) / canvas.height;

        // Add point to array
        points.push(vec2(x, y));

        // Bind buffer and upload data
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        // Associate shader variables with data buffer
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Clear and redraw
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, points.length);
    });
};