window.onload = async function init() {
    // Get the canvas element
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    // Enable OES_element_index_uint extension
    var ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
        alert('OES_element_index_uint is not supported by your browser');
        return;
    }

    // Set up the viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0); // Light gray background
    gl.enable(gl.DEPTH_TEST);

    // Compile and link shader programs
    // Ground Shader Program
    var programGround = initShaders(gl, "vertex-shader-ground", "fragment-shader-ground");
    // Teapot Shader Program
    var programTeapot = initShaders(gl, "vertex-shader-teapot", "fragment-shader-teapot");
    // Shadow Shader Program
    var programShadow = initShaders(gl, "vertex-shader-shadow", "fragment-shader-shadow");

    // Function to initialize attribute variables for a shader program
    function initAttributeVariable(program, buffer, attribute, size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var attribLocation = gl.getAttribLocation(program, attribute);
        gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocation);
    }

    // ======================= Ground Setup =======================
    // Get uniform locations for Ground
    var u_ModelViewMatrixGround = gl.getUniformLocation(programGround, 'modelViewMatrix');
    var u_ProjectionMatrixGround = gl.getUniformLocation(programGround, 'projectionMatrix');
    var u_SamplerGround = gl.getUniformLocation(programGround, 'u_Sampler');

    // Define ground vertices and texture coordinates
    var pointsArray = [];
    var texCoordsArray = [];

    var groundVertices = [
        vec4(-4.0, -1.0, -1.0, 1.0), // Bottom-left
        vec4(4.0, -1.0, -1.0, 1.0),  // Bottom-right
        vec4(4.0, -1.0, -9.0, 1.0),  // Top-right
        vec4(-4.0, -1.0, -9.0, 1.0)  // Top-left
    ];

    var groundTexCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0)
    ];

    pointsArray = pointsArray.concat(groundVertices);
    texCoordsArray = texCoordsArray.concat(groundTexCoords);
    var groundVertexCount = 4;

    // Create buffers for Ground
    var vBufferGround = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGround);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var tBufferGround = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferGround);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    // Load ground texture
    var groundTexture = gl.createTexture();
    var groundImage = new Image();
    var groundLoaded = false;
    groundImage.onload = function() {
        gl.useProgram(programGround);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip the image's y axis
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                      gl.UNSIGNED_BYTE, groundImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.uniform1i(u_SamplerGround, 0); // texture unit 0

        groundLoaded = true;
        if (teapotLoaded) {
            render();
        }
    };
    groundImage.src = '../resources/ground_texture.png'; // Use your ground texture path

    // ======================= Teapot Setup =======================
    // Get uniform locations for Teapot
    var u_ModelMatrixTeapot = gl.getUniformLocation(programTeapot, 'u_ModelMatrix');
    var u_ViewMatrixTeapot = gl.getUniformLocation(programTeapot, 'u_ViewMatrix');
    var u_ProjectionMatrixTeapot = gl.getUniformLocation(programTeapot, 'u_ProjectionMatrix');
    var u_NormalMatrixTeapot = gl.getUniformLocation(programTeapot, 'u_NormalMatrix');

    var u_LightPositionTeapot = gl.getUniformLocation(programTeapot, 'u_LightPosition');
    var u_LightColorTeapot = gl.getUniformLocation(programTeapot, 'u_LightColor');
    var u_AmbientLightTeapot = gl.getUniformLocation(programTeapot, 'u_AmbientLight');
    var u_SpecularColorTeapot = gl.getUniformLocation(programTeapot, 'u_SpecularColor');
    var u_ShininessTeapot = gl.getUniformLocation(programTeapot, 'u_Shininess');

    // Set up the light properties for Teapot
    var lightRadius = 2.0;
    var lightTheta = 0.0;
    var lightDeltaTheta = 0.02;
    var lightCenter = vec3(0.0, 5.0, 0.0);
    var lightMoving = true; // Light animation toggle

    // Add event listener for the light toggle button
    var lightButton = document.getElementById("toggle-light");
    lightButton.addEventListener("click", function() {
        lightMoving = !lightMoving;
        lightButton.textContent = lightMoving ? "Stop Light Circulation" : "Start Light Circulation";
    });

    var lightColor = vec3(1.0, 1.0, 1.0); // White light
    var ambientLight = vec3(0.2, 0.2, 0.2);
    var specularColor = vec3(1.0, 1.0, 1.0); // White specular highlights
    var shininess = 32.0; // Shininess coefficient

    // Set up the view and projection matrices for the camera
    var eye = vec3(0.0, 2.0, 5.0);
    var at = vec3(0.0, -1.0, -5.0);
    var up = vec3(0.0, 1.0, 0.0);

    var viewMatrix = lookAt(eye, at, up);

    var projectionMatrix = perspective(30.0, canvas.width / canvas.height, 1.0, 100.0);

    // Variables for teapot motion
    var teapotY = -1.0; // Initial y position
    var deltaY = 0.01;  // Increment for y position
    var movingUp = true; // Direction flag
    var teapotMotion = true; // Motion toggle

    // Add event listener for the motion toggle button
    var motionButton = document.getElementById("toggle-motion");
    motionButton.addEventListener("click", function() {
        teapotMotion = !teapotMotion;
        motionButton.textContent = teapotMotion ? "Stop Teapot Motion" : "Start Teapot Motion";
    });

    // Variables to store the current rotation angles for the teapot
    var currentAngle = [0.0, 0.0]; // [x-axis rotation, y-axis rotation]

    // Initialize mouse event handlers
    initEventHandlers(canvas, currentAngle);

    // Load the Teapot OBJ file
    const obj_filename = "../resources/teapot.obj"; // Adjust the path if necessary
    let teapotInfo;
    var teapotLoaded = false;

    try {
        teapotInfo = await readOBJFile(obj_filename, 1.0, true);
        teapotLoaded = true;
        if (groundLoaded) {
            render();
        }
    } catch (error) {
        console.error("Error loading teapot OBJ file:", error);
        return;
    }

    // Create buffers for Teapot
    var vertexBufferTeapot = gl.createBuffer();
    var normalBufferTeapot = gl.createBuffer();
    var colorBufferTeapot = gl.createBuffer();
    var indexBufferTeapot = gl.createBuffer();

    if (!vertexBufferTeapot || !normalBufferTeapot || !colorBufferTeapot || !indexBufferTeapot) {
        console.log('Failed to create Teapot buffers');
        return;
    }

    // Write Teapot data into buffers
    // Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferTeapot);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(teapotInfo.vertices), gl.STATIC_DRAW);

    // Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferTeapot);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(teapotInfo.normals), gl.STATIC_DRAW);

    // Colors
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferTeapot);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(teapotInfo.colors), gl.STATIC_DRAW);

    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(teapotInfo.indices), gl.STATIC_DRAW);

    // Set up the initial model matrix for the Teapot
    var modelMatrixTeapot = mat4(); // Identity matrix
    // Scale the teapot to a quarter of its original size
    modelMatrixTeapot = mult(modelMatrixTeapot, scalem(0.25, 0.25, 0.25));
    // Translate it by (0, -1, -3)
    modelMatrixTeapot = mult(modelMatrixTeapot, translate(0, teapotY, -3));

    // ======================= Render Loop =======================
    function render() {
        // Update light position
        if (lightMoving) {
            lightTheta += lightDeltaTheta;
        }
        var lightPosition = vec3(
            lightCenter[0] + lightRadius * Math.cos(lightTheta),
            lightCenter[1],
            lightCenter[2] + lightRadius * Math.sin(lightTheta)
        );

        // Update teapot position if motion is enabled
        if (teapotMotion) {
            if (movingUp) {
                teapotY += deltaY;
                if (teapotY >= 0.5) movingUp = false;
            } else {
                teapotY -= deltaY;
                if (teapotY <= -1.0) movingUp = true;
            }
        }

        // Recalculate the model matrix with the updated y position and rotation
        var modelMatrixTeapotCurrent = mat4();
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, translate(0, teapotY, -3));
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, scalem(0.25, 0.25, 0.25));

        // Apply rotation from mouse movement
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, rotate(currentAngle[0], [1, 0, 0]));
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, rotate(currentAngle[1], [0, 1, 0]));

        // Compute the normal matrix
        var normalMatrixTeapotCurrent = transpose(inverse(modelMatrixTeapotCurrent));

        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // ======================= Draw Ground =======================
        gl.useProgram(programGround);

        // Bind the ground vertex buffer and set up 'a_Position'
        initAttributeVariable(programGround, vBufferGround, 'a_Position', 4);

        // Bind the ground texture coordinate buffer and set up 'a_TexCoord'
        initAttributeVariable(programGround, tBufferGround, 'a_TexCoord', 2);

        // Set modelViewMatrix and projectionMatrix
        var modelViewMatrixGround = mult(viewMatrix, mat4()); // Identity model matrix
        gl.uniformMatrix4fv(u_ModelViewMatrixGround, false, flatten(modelViewMatrixGround));
        gl.uniformMatrix4fv(u_ProjectionMatrixGround, false, flatten(projectionMatrix));

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(u_SamplerGround, 0);

        // Draw the ground quad
        gl.drawArrays(gl.TRIANGLE_FAN, 0, groundVertexCount);

        // ======================= Draw Shadow =======================
        gl.useProgram(programShadow);

        // Compute the shadow projection matrix
        var groundY = -1.0; // y-coordinate of the ground plane
        var epsilon = 0.001; // Small offset to prevent z-fighting
        var yPlane = groundY + epsilon;

        // Compute the distance d
        var d = -(lightPosition[1] - yPlane);

        // Translation matrices
        var T_light = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
        var T_neg_light = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);

        // Projection matrix onto y = yPlane
        var P_proj = mat4();
        P_proj[3][1] = 1 / d;
        P_proj[3][3] = 0;

        // Compute the shadow matrix
        var shadowMat = mult(T_light, mult(P_proj, T_neg_light));

        // Compute the final model-view matrix for the shadow
        var modelViewMatrixShadow = mult(viewMatrix, mult(shadowMat, modelMatrixTeapotCurrent));

        // Bind the teapot vertex buffer and set up 'a_Position'
        initAttributeVariable(programShadow, vertexBufferTeapot, 'a_Position', 4);

        // Set the model-view and projection matrices
        var u_ModelViewMatrixShadow = gl.getUniformLocation(programShadow, 'u_ModelViewMatrix');
        var u_ProjectionMatrixShadow = gl.getUniformLocation(programShadow, 'u_ProjectionMatrix');

        gl.uniformMatrix4fv(u_ModelViewMatrixShadow, false, flatten(modelViewMatrixShadow));
        gl.uniformMatrix4fv(u_ProjectionMatrixShadow, false, flatten(projectionMatrix));

        // Disable depth test and enable blending for the shadow
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Draw the shadow
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
        gl.drawElements(gl.TRIANGLES, teapotInfo.indices.length, gl.UNSIGNED_INT, 0);

        // Re-enable depth test and disable blending
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        // ======================= Draw Teapot =======================
        gl.useProgram(programTeapot);

        // Bind the teapot buffers and set up attributes
        initAttributeVariable(programTeapot, vertexBufferTeapot, 'a_Position', 4);
        initAttributeVariable(programTeapot, normalBufferTeapot, 'a_Normal', 4);
        initAttributeVariable(programTeapot, colorBufferTeapot, 'a_Color', 4);

        // Update uniforms
        gl.uniformMatrix4fv(u_ModelMatrixTeapot, false, flatten(modelMatrixTeapotCurrent));
        gl.uniformMatrix4fv(u_ViewMatrixTeapot, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixTeapot, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(u_NormalMatrixTeapot, false, flatten(normalMatrixTeapotCurrent));

        // Update light uniforms
        gl.uniform3fv(u_LightPositionTeapot, flatten(lightPosition));
        gl.uniform3fv(u_LightColorTeapot, flatten(lightColor));
        gl.uniform3fv(u_AmbientLightTeapot, flatten(ambientLight));
        gl.uniform3fv(u_SpecularColorTeapot, flatten(specularColor));
        gl.uniform1f(u_ShininessTeapot, shininess);

        // Draw the teapot
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
        gl.drawElements(gl.TRIANGLES, teapotInfo.indices.length, gl.UNSIGNED_INT, 0);

        requestAnimationFrame(render);
    }

    // Function to initialize mouse event handlers
    function initEventHandlers(canvas, currentAngle) {
        var dragging = false; // Dragging or not
        var lastX = -1, lastY = -1; // Last position of the mouse

        canvas.onmousedown = function(ev) { // Mouse is pressed
            var x = ev.clientX, y = ev.clientY;
            // Start dragging if a mouse is in <canvas>
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                lastX = x; lastY = y;
                dragging = true;
            }
        };
        // Mouse is released
        canvas.onmouseup = function(ev) { dragging = false; };

        canvas.onmousemove = function(ev) { // Mouse is moved
            var x = ev.clientX, y = ev.clientY;
            if (dragging) {
                var factor = 100 / canvas.height; // The rotation ratio
                var dx = factor * (x - lastX);
                var dy = factor * (y - lastY);
                // Limit x-axis rotation angle to -90 to 90 degrees
                currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
                currentAngle[1] = currentAngle[1] + dx;
            }
            lastX = x, lastY = y;
        };
    }
};