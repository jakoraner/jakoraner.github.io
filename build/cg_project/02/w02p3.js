window.onload = function init() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Initialize variables
    var shapes = []; // Array to store all shapes drawn
    var currentShape = { vertices: [], colors: [] }; // Shape being constructed
    var currentShapePoints = []; // Points clicked in triangle mode
    var currentShapeColors = []; // Colors of points clicked
    var mode = 'point'; // Default drawing mode

    // Get color pickers and buttons
    var bgColorPicker = document.getElementById("bg-color-picker");
    var pointColorPicker = document.getElementById("point-color-picker");
    var clearButton = document.getElementById("clear-button");
    var pointModeButton = document.getElementById('point-mode-button');
    var triangleModeButton = document.getElementById('triangle-mode-button');

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

    // Function to create square around a point
    function createPointVertices(x, y, size) {
        return [
            vec2(x - size, y - size),
            vec2(x + size, y - size),
            vec2(x + size, y + size),

            vec2(x - size, y - size),
            vec2(x + size, y + size),
            vec2(x - size, y + size)
        ];
    }

    // Event listener for mouse click
    canvas.addEventListener('click', function(event) {
        // Get the bounding rectangle of the canvas
        var rect = canvas.getBoundingClientRect();

        // Calculate mouse position in canvas coordinate system
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Convert to WebGL's clip space coordinates (-1 to 1)
        x = (2 * x) / canvas.width - 1;
        y = 1 - (2 * y) / canvas.height;

        if (mode === 'point') {
            // Create square around the point
            var size = 0.02; // Adjust as needed
            var pointVertices = createPointVertices(x, y, size);
            var pointColors = [];
            for (var i = 0; i < pointVertices.length; i++) {
                pointColors.push(pointColor);
            }

            var pointShape = {
                vertices: pointVertices,
                colors: pointColors
            };

            shapes.push(pointShape);

        } else if (mode === 'triangle') {
            // In triangle mode
            currentShapePoints.push(vec2(x, y));
            currentShapeColors.push(pointColor);

            if (currentShapePoints.length <= 2) {
                // Create square around the point
                var size = 0.02; // Adjust as needed
                var pointVertices = createPointVertices(x, y, size);
                var pointColors = [];
                for (var i = 0; i < pointVertices.length; i++) {
                    pointColors.push(pointColor);
                }

                // Add to currentShape
                currentShape.vertices = currentShape.vertices.concat(pointVertices);
                currentShape.colors = currentShape.colors.concat(pointColors);

            } else if (currentShapePoints.length === 3) {
                // Replace currentShape with triangle
                currentShape.vertices = [
                    currentShapePoints[0],
                    currentShapePoints[1],
                    currentShapePoints[2]
                ];

                currentShape.colors = [
                    currentShapeColors[0],
                    currentShapeColors[1],
                    currentShapeColors[2]
                ];

                shapes.push({
                    vertices: currentShape.vertices,
                    colors: currentShape.colors
                });

                // Clear currentShape data
                currentShape = { vertices: [], colors: [] };
                currentShapePoints = [];
                currentShapeColors = [];
            }
        }

        // Redraw the scene
        drawScene();
    });

    // Event listener for point mode button
    pointModeButton.addEventListener('click', function() {
        mode = 'point';
        // Clear current shape data
        currentShape = { vertices: [], colors: [] };
        currentShapePoints = [];
        currentShapeColors = [];
    });

    // Event listener for triangle mode button
    triangleModeButton.addEventListener('click', function() {
        mode = 'triangle';
        // Clear current shape data
        currentShape = { vertices: [], colors: [] };
        currentShapePoints = [];
        currentShapeColors = [];
    });

    // Function to draw the entire scene
    function drawScene() {
        // Clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw all shapes
        for (var i = 0; i < shapes.length; i++) {
            drawShape(shapes[i]);
        }

        // Draw current shape if any
        if (currentShape.vertices.length > 0) {
            drawShape(currentShape);
        }
    }

    // Function to draw a shape
    function drawShape(shape) {
        // Upload data to GPU and draw
        // Bind buffer and upload position data
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Bind color buffer and upload color data
        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // Draw the shape
        gl.drawArrays(gl.TRIANGLES, 0, shape.vertices.length);
    }

    // Event listener for clear button
    clearButton.addEventListener("click", function() {
        // Clear all arrays
        shapes = [];
        currentShape = { vertices: [], colors: [] };
        currentShapePoints = [];
        currentShapeColors = [];

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