window.onload = async function init() {
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get attribute and uniform locations
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    var a_Normal = gl.getAttribLocation(program, 'a_Normal');
    var a_Color = gl.getAttribLocation(program, 'a_Color');
    var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');

    var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    var u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    var u_ProjectionMatrix = gl.getUniformLocation(program, 'u_ProjectionMatrix');
    var u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');
    var u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    var u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
    var u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
    var u_SpecularColor = gl.getUniformLocation(program, 'u_SpecularColor');
    var u_Shininess = gl.getUniformLocation(program, 'u_Shininess');
    var u_Texture = gl.getUniformLocation(program, 'u_Texture');

    // Set up light
    var lightPosition = vec3(5.0, 5.0, 5.0);
    var ambientLight = vec3(0.8, 0.8, 0.8); 
    var lightColor = vec3(1.3, 1.3, 1.3);  
    var specularColor = vec3(1.0, 1.0, 1.0);
    var shininess = 32.0;

    gl.uniform3fv(u_LightPosition, flatten(lightPosition));
    gl.uniform3fv(u_LightColor, flatten(lightColor));
    gl.uniform3fv(u_AmbientLight, flatten(ambientLight));
    gl.uniform3fv(u_SpecularColor, flatten(specularColor));
    gl.uniform1f(u_Shininess, shininess);

    // Set matrices
    var modelMatrix = mat4();
    var viewMatrix = lookAt(vec3(0.0, 0.0, 5.0), vec3(0.0,0.0,0.0), vec3(0.0,1.0,0.0));
    var projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);
    var normalMatrix = transpose(inverse(modelMatrix));

    gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(u_ViewMatrix, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(u_NormalMatrix, false, flatten(normalMatrix));

    // Load the OBJ file
    const obj_filename = "./monkey4.obj";
    let drawingInfo;
    try {
        drawingInfo = await readOBJFile(obj_filename, 1.0, true);
    } catch (error) {
        console.error("Error loading monkey OBJ file:", error);
        return;
    }

    // Create buffers
    var vertexBuffer = gl.createBuffer();
    var normalBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var texCoordBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();

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

    // If your OBJ parser provides texture coordinates, assign them:
    // (Check your OBJ parser or file if `drawingInfo.texCoords` is populated)
    if (drawingInfo.texCoords && drawingInfo.texCoords.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(drawingInfo.texCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);
    } else {
        console.warn("No texture coordinates found in the OBJ file!");
    }

    // Indices
    if (!gl.getExtension('OES_element_index_uint')) {
        alert('OES_element_index_uint not supported');
        return;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(drawingInfo.indices), gl.STATIC_DRAW);

    // Load and create the texture, similar to Earth example
    var texture = gl.createTexture();
    var image = new Image();
    image.onload = function() {
        // Activate texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        // Bind and configure texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Decide whether to flip Y
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                      gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                         gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Set wrapping mode if needed
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // Link the texture to the shader's sampler
        gl.uniform1i(u_Texture, 0);

        render();
    };
    image.src = "./Metal055A_2K-PNG_Roughness.png";

    // Optionally center and/or scale model
    centerModel(drawingInfo);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
        requestAnimationFrame(render);
    }

    function centerModel(drawingInfo) {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < drawingInfo.vertices.length; i += 4) {
            let x = drawingInfo.vertices[i];
            let y = drawingInfo.vertices[i+1];
            let z = drawingInfo.vertices[i+2];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }

        let centerX = (minX + maxX) / 2;
        let centerY = (minY + maxY) / 2;
        let centerZ = (minZ + maxZ) / 2;

        let sizeX = maxX - minX;
        let sizeY = maxY - minY;
        let sizeZ = maxZ - minZ;
        let maxSize = Math.max(sizeX, sizeY, sizeZ);

        var scaleFactor = 1.0;
        if (maxSize > 2.0) {
            scaleFactor = 2.0 / maxSize;
        }

        var translateToCenter = translate(-centerX, -centerY, -centerZ);
        var scaleModel = scalem(scaleFactor, scaleFactor, scaleFactor);

        modelMatrix = mult(scaleModel, modelMatrix);
        modelMatrix = mult(translateToCenter, modelMatrix);
        normalMatrix = transpose(inverse(modelMatrix));

        gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(modelMatrix));
        gl.uniformMatrix4fv(u_NormalMatrix, false, flatten(normalMatrix));
    }
};