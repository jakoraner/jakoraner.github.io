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
        // Texture setup code
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

        // Start rendering after the image has loaded
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

    // Set up projection matrix
    var aspect = canvas.width / canvas.height;
    var fovy = 90.0; // 90 degrees field of view
    var near = 0.1;
    var far = 100.0;
    var projectionMatrix = perspective(fovy, aspect, near, far);

    // Get the locations of the matrices and uniforms in the shader
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    var textureLoc = gl.getUniformLocation(program, "texture");
    var visibilityLoc = gl.getUniformLocation(program, "visibility");

    // Pass the projection matrix to the shader
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set the texture uniform (default to texture unit 0)
    gl.uniform1i(textureLoc, 0);

    // Light source parameters
    var lightRadius = 2.0;
    var lightCenter = vec3(0.0, 2.0, -2.0);
    var lightTheta = 0.0;
    var lightDeltaTheta = 0.02;
    var lightCirculate = true;

    // Button to toggle light circulation
    var toggleLightButton = document.getElementById("toggle-light");
    toggleLightButton.addEventListener("click", function() {
        lightCirculate = !lightCirculate;
        toggleLightButton.textContent = lightCirculate ? "Stop Light Circulation" : "Start Light Circulation";
    });

    // Model matrices for the smaller quads
    var quad1ModelMatrix = mat4(); // Identity matrix for now
    var quad2ModelMatrix = mat4(); // Identity matrix for now

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);

        // Update light position
        if (lightCirculate) {
            lightTheta += lightDeltaTheta;
        }
        var lightPosition = vec4(
            lightCenter[0] + lightRadius * Math.cos(lightTheta),
            lightCenter[1],
            lightCenter[2] + lightRadius * Math.sin(lightTheta),
            1.0
        );

        // Define the ground plane y = yPlane
        var yPlane = -1.0;
        var epsilon = 0.001; // Small offset to handle z-fighting
        var d = -(lightPosition[1] - (yPlane + epsilon)); // d = -(y_l - (y_g + epsilon))

        // Translation matrices
        var T_light = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
        var T_neg_light = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);

        // Projection matrix onto y = yPlane + epsilon
        var P_proj = mat4();
        P_proj[3][1] = 1 / d;
        P_proj[3][3] = 0;

        // Shadow model matrices
        var M_s1 = mult(T_light, mult(P_proj, mult(T_neg_light, quad1ModelMatrix)));
        var M_s2 = mult(T_light, mult(P_proj, mult(T_neg_light, quad2ModelMatrix)));

        // Draw the ground quad
        gl.depthFunc(gl.LESS); // Default depth function
        gl.uniform1f(visibilityLoc, 1.0); // Normal visibility
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.uniform1i(textureLoc, 0);

        var modelViewMatrix = mat4(); // Identity
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        var start = startIndices[0];
        gl.drawArrays(gl.TRIANGLE_FAN, start, groundVertexCount);

        // Draw the shadow polygons
        gl.depthFunc(gl.GREATER); // Accept fragments with greater depth values
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0); // Adjust polygon offset to prevent z-fighting

        gl.uniform1f(visibilityLoc, 0.0); // Set visibility to 0 to draw shadows black

        // No need to bind a texture since we're not using it for shadows, but still need to set a texture unit
        gl.uniform1i(textureLoc, 0); // Ensure a valid texture unit is set

        // Disable blending if it was previously enabled
        gl.disable(gl.BLEND);

        // First shadow polygon
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(M_s1));
        start = startIndices[1];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad1VertexCount);

        // Second shadow polygon
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(M_s2));
        start = startIndices[2];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad2VertexCount);

        // Reset depth function and disable polygon offset
        gl.depthFunc(gl.LESS);
        gl.disable(gl.POLYGON_OFFSET_FILL);

        // Draw the red quads (normal objects)
        gl.uniform1f(visibilityLoc, 1.0); // Normal visibility
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.uniform1i(textureLoc, 1);

        // First red quad
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(quad1ModelMatrix));
        start = startIndices[1];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad1VertexCount);

        // Second red quad
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(quad2ModelMatrix));
        start = startIndices[2];
        gl.drawArrays(gl.TRIANGLE_FAN, start, quad2VertexCount);

        requestAnimationFrame(render);
    };
};