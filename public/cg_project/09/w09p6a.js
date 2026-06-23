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
    // Shadow Map Shader Program (used when rendering from the light's perspective)
    var programShadowMap = initShaders(gl, "vertex-shader-shadow-map", "fragment-shader-shadow-map");

    // Function to initialize attribute variables for a shader program
    function initAttributeVariable(program, buffer, attribute, size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var attribLocation = gl.getAttribLocation(program, attribute);
        gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocation);
    }

    // Initialize the framebuffer object
    var OFFSCREEN_WIDTH = 1024;
    var OFFSCREEN_HEIGHT = 1024;

    var fbo = initFramebufferObject(gl, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    if (!fbo) {
        console.error('Failed to initialize framebuffer object');
        return;
    }

    // ======================= Ground Setup =======================
    // Get uniform locations for Ground
    var u_ModelMatrixGround = gl.getUniformLocation(programGround, 'u_ModelMatrix');
    var u_ViewMatrixGround = gl.getUniformLocation(programGround, 'u_ViewMatrix');
    var u_ProjectionMatrixGround = gl.getUniformLocation(programGround, 'u_ProjectionMatrix');
    var u_MvpMatrixFromLightGround = gl.getUniformLocation(programGround, 'u_MvpMatrixFromLight');
    var u_SamplerGround = gl.getUniformLocation(programGround, 'u_Sampler');
    var u_ShadowMapGround = gl.getUniformLocation(programGround, 'u_ShadowMap');

    // Define ground vertices and texture coordinates
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

    var groundVertexCount = 4;

    // Create buffers for Ground
    var vBufferGround = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGround);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(groundVertices), gl.STATIC_DRAW);

    var tBufferGround = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferGround);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(groundTexCoords), gl.STATIC_DRAW);

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
        if (teapotLoaded && fbo) {
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
    var u_MvpMatrixFromLightTeapot = gl.getUniformLocation(programTeapot, 'u_MvpMatrixFromLight');
    var u_ShadowMapTeapot = gl.getUniformLocation(programTeapot, 'u_ShadowMap');

    var u_LightPositionTeapot = gl.getUniformLocation(programTeapot, 'u_LightPosition');
    var u_LightColorTeapot = gl.getUniformLocation(programTeapot, 'u_LightColor');
    var u_AmbientLightTeapot = gl.getUniformLocation(programTeapot, 'u_AmbientLight');
    var u_SpecularColorTeapot = gl.getUniformLocation(programTeapot, 'u_SpecularColor');
    var u_ShininessTeapot = gl.getUniformLocation(programTeapot, 'u_Shininess');

    // Set up the light properties for Teapot
    var lightRadius = 2.0;
    var lightTheta = 0.0;
    var lightDeltaTheta = 0.02;
    var lightCenter = vec3(0.0, 5.0, 0.0); // Increase Y to 40 as per the guide
    var lightMoving = false; // Light animation toggle

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
    var viewMatrix = lookAt(
        vec3(lightCenter[0], lightCenter[1] + 5.0, lightCenter[2]), // Eye position above the light
        vec3(0.0, 0.0, -2.0),                                      // Look-at point (scene center)
        vec3(0.0, 0.0, -1.0)                                       // Up vector (invert z-axis)
    );

    var projectionMatrix = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);

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

    // Load the Teapot OBJ file
    const obj_filename = "../resources/teapot.obj"; // Adjust the path if necessary
    let teapotInfo;
    var teapotLoaded = false;

    try {
        teapotInfo = await readOBJFile(obj_filename, 1.0, true);
        teapotLoaded = true;
        if (groundLoaded && fbo) {
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
    modelMatrixTeapot = mult(modelMatrixTeapot, translate(0, -1, -3));

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

        // Update teapot position
        if (teapotMotion) {
            if (movingUp) {
                teapotY += deltaY;
                if (teapotY >= 0.5) movingUp = false;
            } else {
                teapotY -= deltaY;
                if (teapotY <= -1.0) movingUp = true;
            }
        }

        var modelMatrixTeapotCurrent = mat4();
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, translate(0, teapotY, -3));
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, scalem(0.25, 0.25, 0.25));

        // ======================= First Pass: Render to Shadow Map =======================
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, fbo.width, fbo.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use the shadow map shader program
        gl.useProgram(programShadowMap);

        // Set up light's view and projection matrices
        var lightViewMatrix = lookAt(lightPosition, vec3(0.0, 0.0, -2.0), vec3(0.0, 1.0, 0.0));
        var lightProjectionMatrix = perspective(70.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);

        // Render the teapot from the light's point of view
        initAttributeVariable(programShadowMap, vertexBufferTeapot, 'a_Position', 4);

        var u_ModelMatrixShadowMap = gl.getUniformLocation(programShadowMap, 'u_ModelMatrix');
        var u_ViewMatrixShadowMap = gl.getUniformLocation(programShadowMap, 'u_ViewMatrix');
        var u_ProjectionMatrixShadowMap = gl.getUniformLocation(programShadowMap, 'u_ProjectionMatrix');

        gl.uniformMatrix4fv(u_ModelMatrixShadowMap, false, flatten(modelMatrixTeapotCurrent));
        gl.uniformMatrix4fv(u_ViewMatrixShadowMap, false, flatten(lightViewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixShadowMap, false, flatten(lightProjectionMatrix));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
        gl.drawElements(gl.TRIANGLES, teapotInfo.indices.length, gl.UNSIGNED_INT, 0);

        // Render the ground from the light's point of view
        initAttributeVariable(programShadowMap, vBufferGround, 'a_Position', 4);

        gl.uniformMatrix4fv(u_ModelMatrixShadowMap, false, flatten(mat4())); // Ground model matrix is identity
        gl.uniformMatrix4fv(u_ViewMatrixShadowMap, false, flatten(lightViewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixShadowMap, false, flatten(lightProjectionMatrix));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, groundVertexCount);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind framebuffer

        // ======================= Second Pass: Render Scene Normally =======================
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the MVP matrix from the light's point of view for the teapot
        var mvpMatrixFromLightTeapot = mult(lightProjectionMatrix, mult(lightViewMatrix, modelMatrixTeapotCurrent));

        // Compute the MVP matrix from the light's point of view for the ground
        var mvpMatrixFromLightGround = mult(lightProjectionMatrix, mult(lightViewMatrix, mat4()));

        // Render the ground
        gl.useProgram(programGround);

        initAttributeVariable(programGround, vBufferGround, 'a_Position', 4);
        initAttributeVariable(programGround, tBufferGround, 'a_TexCoord', 2);

        gl.uniformMatrix4fv(u_ModelMatrixGround, false, flatten(mat4()));
        gl.uniformMatrix4fv(u_ViewMatrixGround, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixGround, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(u_MvpMatrixFromLightGround, false, flatten(mvpMatrixFromLightGround));

        // Bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(u_SamplerGround, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        gl.uniform1i(u_ShadowMapGround, 1);

        // Draw ground
        gl.drawArrays(gl.TRIANGLE_FAN, 0, groundVertexCount);

        // Render the teapot
        gl.useProgram(programTeapot);

        initAttributeVariable(programTeapot, vertexBufferTeapot, 'a_Position', 4);
        initAttributeVariable(programTeapot, normalBufferTeapot, 'a_Normal', 4);
        initAttributeVariable(programTeapot, colorBufferTeapot, 'a_Color', 4);

        var normalMatrixTeapotCurrent = transpose(inverse(modelMatrixTeapotCurrent));

        gl.uniformMatrix4fv(u_ModelMatrixTeapot, false, flatten(modelMatrixTeapotCurrent));
        gl.uniformMatrix4fv(u_ViewMatrixTeapot, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixTeapot, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(u_NormalMatrixTeapot, false, flatten(normalMatrixTeapotCurrent));
        gl.uniformMatrix4fv(u_MvpMatrixFromLightTeapot, false, flatten(mvpMatrixFromLightTeapot));

        // Update light uniforms
        gl.uniform3fv(u_LightPositionTeapot, flatten(lightPosition));
        gl.uniform3fv(u_LightColorTeapot, flatten(lightColor));
        gl.uniform3fv(u_AmbientLightTeapot, flatten(ambientLight));
        gl.uniform3fv(u_SpecularColorTeapot, flatten(specularColor));
        gl.uniform1f(u_ShininessTeapot, shininess);

        // Bind shadow map
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        gl.uniform1i(u_ShadowMapTeapot, 1);

        // Draw teapot
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
        gl.drawElements(gl.TRIANGLES, teapotInfo.indices.length, gl.UNSIGNED_INT, 0);

        requestAnimationFrame(render);
    }

    // Function to initialize the framebuffer object with updated texture format
    function initFramebufferObject(gl, width, height) {
        var framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.error('Failed to create framebuffer object');
            return null;
        }

        var texture = gl.createTexture();
        if (!texture) {
            console.error('Failed to create texture object');
            gl.deleteFramebuffer(framebuffer);
            return null;
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Use RGBA format to store depth across all four channels
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
                      gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Set texture wrapping mode to CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var depthBuffer = gl.createRenderbuffer();
        if (!depthBuffer) {
            console.error('Failed to create renderbuffer object');
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
            return null;
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer object is incomplete: ' + status.toString());
            gl.deleteRenderbuffer(depthBuffer);
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return null;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        framebuffer.texture = texture;
        framebuffer.width = width;
        framebuffer.height = height;

        return framebuffer;
    }

};