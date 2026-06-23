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

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get the attribute and uniform locations from the shaders
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    var a_Normal = gl.getAttribLocation(program, 'a_Normal');
    var a_Color = gl.getAttribLocation(program, 'a_Color');

    var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    var u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    var u_ProjectionMatrix = gl.getUniformLocation(program, 'u_ProjectionMatrix');
    var u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');
    var u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    var u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
    var u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
    var u_SpecularColor = gl.getUniformLocation(program, 'u_SpecularColor');
    var u_Shininess = gl.getUniformLocation(program, 'u_Shininess');

    // Set up the light
    var lightPosition = vec3(5.0, 5.0, 5.0);
    var lightColor = vec3(1.0, 1.0, 1.0); // White light
    var ambientLight = vec3(0.2, 0.2, 0.2);
    var specularColor = vec3(1.0, 1.0, 1.0); // White specular highlights
    var shininess = 32.0; // Shininess coefficient

    gl.uniform3fv(u_LightPosition, flatten(lightPosition));
    gl.uniform3fv(u_LightColor, flatten(lightColor));
    gl.uniform3fv(u_AmbientLight, flatten(ambientLight));
    gl.uniform3fv(u_SpecularColor, flatten(specularColor));
    gl.uniform1f(u_Shininess, shininess);

    // Set up the model, view, and projection matrices
    var modelMatrix = mat4(); // Identity matrix
    var viewMatrix = lookAt(vec3(0.0, 0.0, 5.0), // Eye position
                            vec3(0.0, 0.0, 0.0), // Look-at point
                            vec3(0.0, 1.0, 0.0)); // Up vector
    var projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);

    // Set up the normal matrix
    var normalMatrix = transpose(inverse(modelMatrix));

    gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(u_ViewMatrix, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(u_NormalMatrix, false, flatten(normalMatrix));

    // Load the OBJ file
    const obj_filename = "./monkey2.obj"; // Adjust the path if necessary
    let drawingInfo;
    try {
        drawingInfo = await readOBJFile(obj_filename, 1.0, true);
    } catch (error) {
        console.error(error);
        return;
    }

    // Center the model
    centerModel(drawingInfo);

    // Create buffers
    var vertexBuffer = gl.createBuffer();
    var normalBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();

    if (!vertexBuffer || !normalBuffer || !colorBuffer || !indexBuffer) {
        console.log('Failed to create buffers');
        return;
    }

    // Write data into the buffers
    // Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(drawingInfo.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(drawingInfo.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    // Colors
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(drawingInfo.colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Indices (enable 32-bit unsigned int indices)
    if (!gl.getExtension('OES_element_index_uint')) {
        alert('OES_element_index_uint is not supported by your browser');
        return;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(drawingInfo.indices), gl.STATIC_DRAW);

    // Draw the model
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Optionally, rotate the model for better visualization
        // Uncomment the following lines to enable rotation
        /*
        var angle = performance.now() / 1000 * 45; // Rotate 45 degrees per second
        var rotationMatrix = rotate(angle, [0, 1, 0]);
        var currentModelMatrix = mult(rotationMatrix, modelMatrix);
        var currentNormalMatrix = transpose(inverse(currentModelMatrix));

        gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(currentModelMatrix));
        gl.uniformMatrix4fv(u_NormalMatrix, false, flatten(currentNormalMatrix));
        */

        gl.drawElements(gl.TRIANGLES, drawingInfo.indices.length, gl.UNSIGNED_INT, 0);

        requestAnimationFrame(render);
    }

    render();

    /**
     * Centers the model by translating it so that its centroid is at the origin.
     * Also scales the model to fit within a unit cube if necessary.
     * @param {Object} drawingInfo - The drawing information containing vertices, normals, colors, and indices.
     */
    function centerModel(drawingInfo) {
        if (!drawingInfo || !drawingInfo.vertices || drawingInfo.vertices.length === 0) {
            console.error("Invalid drawingInfo provided to centerModel.");
            return;
        }

        // Compute the bounding box of the model
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < drawingInfo.vertices.length; i += 4) {
            let x = drawingInfo.vertices[i];
            let y = drawingInfo.vertices[i + 1];
            let z = drawingInfo.vertices[i + 2];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        // Compute the center of the bounding box
        let centerX = (minX + maxX) / 2;
        let centerY = (minY + maxY) / 2;
        let centerZ = (minZ + maxZ) / 2;

        // Compute the size of the bounding box
        let sizeX = maxX - minX;
        let sizeY = maxY - minY;
        let sizeZ = maxZ - minZ;
        let maxSize = Math.max(sizeX, sizeY, sizeZ);

        // Determine if scaling is necessary (optional)
        // For example, scale the model to fit within a unit cube
        var scaleFactor = 1.0;
        if (maxSize > 2.0) { // Adjust threshold as needed
            scaleFactor = 2.0 / maxSize;
        }

        // Create translation and scaling matrices
        var translateToCenter = translate(-centerX, -centerY, -centerZ);
        var scaleModel = scalem(scaleFactor, scaleFactor, scaleFactor);

        // Apply transformations to the model matrix
        modelMatrix = mult(scaleModel, modelMatrix);
        modelMatrix = mult(translateToCenter, modelMatrix);

        // Update the normal matrix
        normalMatrix = transpose(inverse(modelMatrix));

        // Upload the updated model and normal matrices to the shaders
        gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(u_NormalMatrix, false, flatten(normalMatrix));
    }
};