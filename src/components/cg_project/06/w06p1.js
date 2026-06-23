window.onload = function() {
    // Get the canvas element
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Define the vertices of the rectangle
    var vertices = [
        vec3(-4.0, -1.0, -1.0),
        vec3(4.0, -1.0, -1.0),
        vec3(4.0, -1.0, -21.0),
        vec3(-4.0, -1.0, -21.0)
    ];

    // Define the texture coordinates
    var texCoords = [
        vec2(-1.5, 0.0),
        vec2(2.5, 0.0),
        vec2(2.5, 10.0),
        vec2(-1.5, 10.0)
    ];

    // Indices for the two triangles that make up the rectangle
    var indices = [0, 1, 2, 0, 2, 3];

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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate vertex data with shader variables
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the texture coordinate data into the GPU
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    // Associate texture coordinate data with shader variables
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Load the index data into the GPU
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // Create the checkerboard texture
    var textureSize = 64;
    var numChecks = 8;
    var image = new Uint8Array(4 * textureSize * textureSize);

    for (var i = 0; i < textureSize; i++) {
        for (var j = 0; j < textureSize; j++) {
            var patchx = Math.floor(i / (textureSize / numChecks));
            var patchy = Math.floor(j / (textureSize / numChecks));
            var c = (patchx % 2 === patchy % 2) ? 255 : 0;
            var idx = 4 * (i * textureSize + j);
            image[idx] = c;
            image[idx + 1] = c;
            image[idx + 2] = c;
            image[idx + 3] = 255;
        }
    }

    // Create a texture object and bind it
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Generate mipmaps and set filtering parameters
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Set up projection and model-view matrices
    var aspect = canvas.width / canvas.height;
    var fovy = 90.0;
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

    // Set the texture uniform
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the rectangle
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
};