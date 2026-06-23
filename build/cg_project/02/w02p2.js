window.onload = function init() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Initialize variables
    var points = [];
    var colors = [];

    // Get the background color picker and point color picker elements
    var bgColorPicker = document.getElementById("bg-color-picker");
    var pointColorPicker = document.getElementById("point-color-picker");

    // Default colors
    var bgColor = hexToVec4(bgColorPicker.value); // Initialize with picker value
    var pointColor = hexToVec4(pointColorPicker.value); // Initialize with picker value

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get attribute locations
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var vColor = gl.getAttribLocation(program, "vColor");

    // Create buffers
    var bufferId = gl.createBuffer();
    var cBufferId = gl.createBuffer();

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

        // Add current point color to colors array
        colors.push(pointColor);

        // Bind buffer and upload position data
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Bind color buffer and upload color data
        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Clear and redraw
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, points.length);
    });

    // Event listener for clear button
    var clearButton = document.getElementById("clear-button");
    clearButton.addEventListener("click", function() {
        // Clear points and colors arrays
        points = [];
        colors = [];

        // Get color from background color picker
        var hexColor = bgColorPicker.value;
        bgColor = hexToVec4(hexColor);

        // Update clear color
        gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);

        // Clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
    });

    // Event listener for point color picker
    pointColorPicker.addEventListener("input", function() {
        // Get color from picker
        var hexColor = pointColorPicker.value;
        pointColor = hexToVec4(hexColor);
    });

    // Function to convert hex color to vec4
    function hexToVec4(hex) {
        // Remove '#' if present
        if (hex.charAt(0) === '#') {
            hex = hex.slice(1);
        }

        // Convert to integer
        var bigint = parseInt(hex, 16);
        var r = ((bigint >> 16) & 255) / 255;
        var g = ((bigint >> 8) & 255) / 255;
        var b = (bigint & 255) / 255;
        return vec4(r, g, b, 1.0);
    }
};