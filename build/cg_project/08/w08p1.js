window.onload = function() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Arrays to hold vertex positions and texture coordinates
    var pointsArray = [];
    var texCoordsArray = [];
    var startIndices = []; // To keep track of starting indices for each object

    // Ground Quad (Textured with xamp23.png)
    var groundVertices = [
        vec4(-2.0, -1.0, -1.0, 1.0),
        vec4(2.0, -1.0, -1.0, 1.0),
        vec4(2.0, -1.0, -5.0, 1.0),
        vec4(-2.0, -1.0, -5.0, 1.0)
    ];

    var groundTexCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0)
    ];

    startIndices.push(pointsArray.length);
    pointsArray = pointsArray.concat(groundVertices);
    texCoordsArray = texCoordsArray.concat(groundTexCoords);
    var groundVertexCount = 4;

    // First Red Quad (Parallel to y = -1, at y = -0.5)
    var quad1Vertices = [
        vec4(0.25, -0.5, -1.25, 1.0),
        vec4(0.75, -0.5, -1.25, 1.0),
        vec4(0.75, -0.5, -1.75, 1.0),
        vec4(0.25, -0.5, -1.75, 1.0)
    ];

    var quad1TexCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0)
    ];

    startIndices.push(pointsArray.length);
    pointsArray = pointsArray.concat(quad1Vertices);
    texCoordsArray = texCoordsArray.concat(quad1TexCoords);
    var quad1VertexCount = 4;

    // Second Red Quad (Perpendicular to y = -1)
    var quad2Vertices = [
        vec4(-1.0, -1.0, -2.5, 1.0),
        vec4(-1.0, 0.0, -2.5, 1.0),
        vec4(-1.0, 0.0, -3.0, 1.0),
        vec4(-1.0, -1.0, -3.0, 1.0)
    ];

    var quad2TexCoords = [
        vec2(0.0, 0.0),
        vec2(0.0, 1.0),
        vec2(1.0, 1.0),
        vec2(1.0, 0.0)
    ];

    startIndices.push(pointsArray.length);
    pointsArray = pointsArray.concat(quad2Vertices);
    texCoordsArray = texCoordsArray.concat(quad2TexCoords);
    var quad2VertexCount = 4;

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0); // Blue background
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

    // Load the texture coordinate data into the GPU
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    // Associate texture coordinate data with shader variables
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Load the texture from xamp23.png (gl.TEXTURE0)
    var texture0 = gl.createTexture();
    var image = new Image();
    image.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip the image's y axis
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                      gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                         gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Set texture wrapping mode to REPEAT
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        render();
    };
    image.src = 'xamp23.png'; // Ensure this texture exists and is correctly placed

    // Create a one-color red texture (gl.TEXTURE1)
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    var redColor = new Uint8Array([255, 0, 0, 255]); // RGBA
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, redColor);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Set up projection and model-view matrices
    var aspect = canvas.width / canvas.height;
    var fovy = 90.0; // 90 degrees field of view
    var near = 0.1;
    var far = 100.0;
    var projectionMatrix = perspective(fovy, aspect, near, far);

    var modelViewMatrix = mat4(); // Identity matrix

    // Get the locations of the matrices in the shader
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // Pass the matrices to the shader
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set the texture uniform (default to texture unit 0)
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Render the scene
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw the ground quad
        // Use texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        var start = startIndices[0];
        gl.drawArrays(gl.TRIANGLE_FAN, start, groundVertexCount);

        // Draw the first red quad
        // Use texture unit 1
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);

        start = startIndices[1];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad1VertexCount);

        // Draw the second red quad
        // Use texture unit 1
        start = startIndices[2];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad2VertexCount);
    }
};