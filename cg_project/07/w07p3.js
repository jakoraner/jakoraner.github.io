// w07p3.js
window.onload = function() {
    var canvas = document.getElementById("gl");
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    var numTimesToSubdivide = 5; 
    var index = 0;
    var pointsArray = [];
    var normalsArray = [];

    function triangle(a, b, c) {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

        normalsArray.push(vec3(a));
        normalsArray.push(vec3(b));
        normalsArray.push(vec3(c));

        index += 3;
    }

    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(a, c, d, n);
        divideTriangle(a, d, b, n);
        divideTriangle(b, c, d, n);
    }

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    // Generate the sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    // Background quad in clip space
    var quadVertices = [
        vec4(-1, -1, 0.999, 1),
        vec4(1, -1, 0.999, 1),
        vec4(1, 1, 0.999, 1),
        vec4(-1, 1, 0.999, 1)
    ];

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0,0,0,1);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.program = program;

    // Sphere buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(vNormal);

    // Quad buffer
    var quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(quadVertices), gl.STATIC_DRAW);

    // Initialize cubemap
    initTexture(gl);

    var modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    var MtexLoc = gl.getUniformLocation(program, "Mtex");
    var reflectiveLoc = gl.getUniformLocation(program, "reflective");
    var eyePositionLoc = gl.getUniformLocation(program, "eyePosition");

    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(90.0, aspect, 0.1, 100.0);

    var orbiting = true;
    var radius = 5.0;
    var alpha = 0.0;
    var deltaAlpha = 0.02;

    function render() {
        if (g_tex_ready < 6) {
            requestAnimationFrame(render);
            return; 
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (orbiting) {
            alpha += deltaAlpha;
            if (alpha > 2*Math.PI) alpha -= 2*Math.PI;
        }

        var eye = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        var at = vec3(0,0,0);
        var up = vec3(0,1,0);

        var viewMatrix = lookAt(eye, at, up);

        // Draw background
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1i(reflectiveLoc, 0); // 0 means background (non-reflective)

        var inverseProjectionMatrix = inverse(projectionMatrix);
        var n = normalize(subtract(eye, at));
        var u = normalize(cross(up, n));
        var v = cross(n,u);

        var R = mat3(u,v,n);
        var inverseRotationMatrix = transpose(R);
        var inverseRotationMatrix4 = mat4(
            inverseRotationMatrix[0][0], inverseRotationMatrix[0][1], inverseRotationMatrix[0][2], 0,
            inverseRotationMatrix[1][0], inverseRotationMatrix[1][1], inverseRotationMatrix[1][2], 0,
            inverseRotationMatrix[2][0], inverseRotationMatrix[2][1], inverseRotationMatrix[2][2], 0,
            0,0,0,1
        );
        var Mtex = mult(inverseRotationMatrix4, inverseProjectionMatrix);

        gl.uniformMatrix4fv(MtexLoc, false, flatten(Mtex));
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(mat4()));

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(vPosition);
        gl.disableVertexAttribArray(vNormal);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        gl.drawArrays(gl.TRIANGLE_FAN,0,4);

        gl.enable(gl.DEPTH_TEST);

        // Draw sphere
        gl.uniform1i(reflectiveLoc, 1); // 1 means reflective object (sphere)
        gl.uniform3fv(eyePositionLoc, flatten(eye));

        var scaleFactor = 1.5;
        var scalingMatrix = scalem(scaleFactor,scaleFactor,scaleFactor);
        var modelMatrix = mult(scalingMatrix, rotateY(180));
        var modelViewMatrix = mult(viewMatrix, modelMatrix);

        gl.uniformMatrix4fv(modelMatrixLoc,false,flatten(modelMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc,false,flatten(projectionMatrix));
        gl.uniformMatrix4fv(MtexLoc,false,flatten(mat4()));

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(vNormal,3,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(vNormal);

        gl.drawArrays(gl.TRIANGLES,0,pointsArray.length);

        requestAnimationFrame(render);
    }

    var g_tex_ready=0;
    var texture;
    function initTexture(gl) {
        var cubemap = [
            'textures/cm_left.png',
            'textures/cm_right.png',
            'textures/cm_top.png',
            'textures/cm_bottom.png',
            'textures/cm_back.png',
            'textures/cm_front.png'
        ];
        gl.activeTexture(gl.TEXTURE0);
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        for (var i=0;i<6;++i) {
            var image = document.createElement('img');
            image.crossOrigin='anonymous';
            image.textarget=gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            image.onload = function(event) {
                var image=event.target;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
                gl.texImage2D(image.textarget,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
                ++g_tex_ready;
                if (g_tex_ready===6) {
                    render();
                }
            };
            image.src=cubemap[i];
        }
        var texMapLoc=gl.getUniformLocation(gl.program,"texMap");
        gl.uniform1i(texMapLoc,0);
    }

    var toggleOrbitButton = document.getElementById("toggle-orbit");
    toggleOrbitButton.addEventListener("click",function() {
        orbiting=!orbiting;
        toggleOrbitButton.textContent=orbiting?"Stop Orbiting":"Start Orbiting";
    });
};