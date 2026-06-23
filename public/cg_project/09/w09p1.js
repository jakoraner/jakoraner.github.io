window.onload = async function init() {
    // Get the canvas element
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
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

        // After the ground texture is loaded, check if the teapot is loaded
        if (teapotLoaded) {
            render();
        } else {
            groundLoaded = true;
        }
    };
    groundImage.src = '../resources/ground_texture.png'; // Use the same texture as in w08p3

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
    var lightPosition = vec3(5.0, 5.0, 5.0);
    var lightColor = vec3(1.0, 1.0, 1.0); // White light
    var ambientLight = vec3(0.2, 0.2, 0.2);
    var specularColor = vec3(1.0, 1.0, 1.0); // White specular highlights
    var shininess = 32.0; // Shininess coefficient

    // Pass light uniforms to Teapot shader
    gl.useProgram(programTeapot);
    gl.uniform3fv(u_LightPositionTeapot, flatten(lightPosition));
    gl.uniform3fv(u_LightColorTeapot, flatten(lightColor));
    gl.uniform3fv(u_AmbientLightTeapot, flatten(ambientLight));
    gl.uniform3fv(u_SpecularColorTeapot, flatten(specularColor));
    gl.uniform1f(u_ShininessTeapot, shininess);

    // Set up the view and projection matrices for Teapot
    var viewMatrix = lookAt(vec3(0.0, 0.5, 2.0), // Eye position
                            vec3(0.0, 0.0, 0.0), // Look-at point
                            vec3(0.0, 1.0, 0.0)); // Up vector

    var projectionMatrix = perspective(90.0, canvas.width / canvas.height, 0.1, 100.0);

    gl.useProgram(programTeapot);
    gl.uniformMatrix4fv(u_ViewMatrixTeapot, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(u_ProjectionMatrixTeapot, false, flatten(projectionMatrix));

    // Load the Teapot OBJ file
    const obj_filename = "../resources/teapot.obj"; // Relative path
    let teapotInfo;
    var teapotLoaded = false;
    var groundLoaded = false;

    try {
        teapotInfo = await readOBJFile(obj_filename, 1.0, true);
        teapotLoaded = true;
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
    if (!gl.getExtension('OES_element_index_uint')) {
        alert('OES_element_index_uint is not supported by your browser');
        return;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(teapotInfo.indices), gl.STATIC_DRAW);

    // Set up the initial model and normal matrices for the Teapot
    var modelMatrixTeapot = mat4(); // Identity matrix
    // Scale the teapot to a quarter of its original size
    modelMatrixTeapot = mult(modelMatrixTeapot, scalem(0.25, 0.25, 0.25));
    // Translate it by (0, -1, -3)
    modelMatrixTeapot = mult(modelMatrixTeapot, translate(0, -1, -3));

    // Compute the normal matrix
    var normalMatrixTeapot = transpose(inverse(modelMatrixTeapot));

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

    // After the teapot is loaded, check if the ground is loaded
    if (groundLoaded) {
        render();
    } else {
        teapotLoaded = true;
    }

    // ======================= Render Loop =======================
    function render() {
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // ======================= Draw Ground =======================
        gl.useProgram(programGround);

        // Bind the ground vertex buffer and set up 'a_Position'
        initAttributeVariable(programGround, vBufferGround, 'a_Position', 4);

        // Bind the ground texture coordinate buffer and set up 'a_TexCoord'
        initAttributeVariable(programGround, tBufferGround, 'a_TexCoord', 2);

        // Set modelViewMatrix and projectionMatrix
        var modelViewMatrixGround = mat4(); // Identity matrix
        gl.uniformMatrix4fv(u_ModelViewMatrixGround, false, flatten(modelViewMatrixGround));
        gl.uniformMatrix4fv(u_ProjectionMatrixGround, false, flatten(projectionMatrix));

        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        gl.uniform1i(u_SamplerGround, 0);

        // Draw the ground quad
        gl.drawArrays(gl.TRIANGLE_FAN, 0, groundVertexCount);

        // ======================= Draw Teapot =======================
        gl.useProgram(programTeapot);

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

        // Recalculate the model matrix with the updated y position
        var modelMatrixTeapotCurrent = mat4();
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, scalem(0.25, 0.25, 0.25));
        modelMatrixTeapotCurrent = mult(modelMatrixTeapotCurrent, translate(0, teapotY, -3));

        // Compute the normal matrix
        var normalMatrixTeapotCurrent = transpose(inverse(modelMatrixTeapotCurrent));

        // Bind the teapot vertex buffer and set up 'a_Position'
        initAttributeVariable(programTeapot, vertexBufferTeapot, 'a_Position', 4);

        // Bind the teapot normal buffer and set up 'a_Normal'
        initAttributeVariable(programTeapot, normalBufferTeapot, 'a_Normal', 4);

        // Bind the teapot color buffer and set up 'a_Color'
        initAttributeVariable(programTeapot, colorBufferTeapot, 'a_Color', 4);

        // Set view and projection matrices
        gl.uniformMatrix4fv(u_ViewMatrixTeapot, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(u_ProjectionMatrixTeapot, false, flatten(projectionMatrix));

        // Pass the current model and normal matrices
        gl.uniformMatrix4fv(u_ModelMatrixTeapot, false, flatten(modelMatrixTeapotCurrent));
        gl.uniformMatrix4fv(u_NormalMatrixTeapot, false, flatten(normalMatrixTeapotCurrent));

        // Draw the teapot
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferTeapot);
        gl.drawElements(gl.TRIANGLES, teapotInfo.indices.length, gl.UNSIGNED_INT, 0);

        requestAnimationFrame(render);
    }
};