window.onload = function() {
    // Get the canvas and WebGL context
    var canvas = document.getElementById('gl');
    var gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert('WebGL is not available');
        return;
    }

    // Variables for subdivision
    var NumTimesToSubdivide = 3; // Initial subdivision level
    var pointsArray = [];
    var normalsArray = []; // Array to store normals

    // Define the vertices of a tetrahedron (points on the unit sphere)
    var va = vec4(0.0, 0.0, 1.0, 1.0);
    var vb = vec4(0.0, 0.942809, -0.333333, 1.0);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1.0);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1.0);

    // Shader program and locations
    var program;
    var aPositionLoc;
    var aNormalLoc; // New attribute location for normals
    var uModelViewMatrixLoc;
    var uProjectionMatrixLoc;
    var uNormalMatrixLoc;
    var uLeAmbientLoc; // Renamed from uKaLoc
    var uKdLoc;
    var uKsLoc;
    var uShininessLoc;
    var uLeLoc;
    var uLightDirLoc;

    // Matrices
    var projectionMatrix;
    var modelViewMatrix;
    var normalMatrix;

    // Buffers
    var vBuffer;
    var nBuffer; // Buffer for normals

    // Lighting and Material parameters (initial values)
    var LeAmbient = 0.1;                      // Ambient radiance (formerly ka)
    var kd = 0.7;                             // Diffuse reflection coefficient
    var ks = 0.5;                             // Specular reflection coefficient
    var shininess = 32.0;                     // Shininess exponent
    var Le = vec3(1.0, 1.0, 1.0);             // Light emission as vec3

    // Light direction in world space
    var lightDir = vec3(0.0, 0.0, -1.0);      // Light coming from the front

    // Camera orbiting parameters
    var orbiting = false;
    var radius = 4.0;
    var alpha = 0.0;
    var deltaAlpha = 0.02; // radians per frame

    // Depth testing and culling flags
    var depthTestingEnabled = true; // Enabled by default
    var cullingEnabled = false;     // Disabled by default

    // Initialize the sphere geometry
    function initSphere() {
        pointsArray = [];
        normalsArray = []; // Reset normals array
        tetrahedron(va, vb, vc, vd, NumTimesToSubdivide);

        // Load the vertex positions into GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        // Load the normals into GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    }

    // Recursive subdivision of triangles
    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(a, c, d, n);
        divideTriangle(a, d, b, n);
        divideTriangle(b, c, d, n);
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

    function triangle(a, b, c) {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

        // For a sphere centered at the origin, the normal is the normalized position vector
        normalsArray.push(normalize(vec3(a)));
        normalsArray.push(normalize(vec3(b)));
        normalsArray.push(normalize(vec3(c)));
    }

    // Initialize WebGL
    function init() {
        // Set viewport and clear color
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.392, 0.584, 0.929, 1.0); // Cornflower blue

        // Enable depth testing by default
        gl.enable(gl.DEPTH_TEST);

        // Disable back-face culling by default
        gl.disable(gl.CULL_FACE);

        // Initialize shaders
        program = initShaders(gl, 'vertex-shader', 'fragment-shader');
        gl.useProgram(program);

        // Get attribute and uniform locations
        aPositionLoc = gl.getAttribLocation(program, 'aPosition');
        aNormalLoc = gl.getAttribLocation(program, 'aNormal'); // Get normal attribute location
        uModelViewMatrixLoc = gl.getUniformLocation(program, 'uModelViewMatrix');
        uProjectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
        uNormalMatrixLoc = gl.getUniformLocation(program, 'uNormalMatrix');
        uLeAmbientLoc = gl.getUniformLocation(program, 'uLeAmbient'); // Renamed
        uKdLoc = gl.getUniformLocation(program, 'uKd');
        uKsLoc = gl.getUniformLocation(program, 'uKs');
        uShininessLoc = gl.getUniformLocation(program, 'uShininess');
        uLeLoc = gl.getUniformLocation(program, 'uLe');
        uLightDirLoc = gl.getUniformLocation(program, 'uLightDir');

        // Create buffers
        vBuffer = gl.createBuffer();
        nBuffer = gl.createBuffer(); // Create buffer for normals

        // Set up the projection matrix
        initProjectionMatrix();

        // Initialize sphere geometry
        initSphere();

        // Set lighting and material uniforms
        updateLightingAndMaterial();

        // Setup buttons and sliders
        setupControls();

        // Start rendering
        render();
    }

    // Set up projection matrix
    function initProjectionMatrix() {
        var aspect = canvas.width / canvas.height;
        projectionMatrix = perspective(45.0, aspect, 0.1, 100.0);
        gl.uniformMatrix4fv(uProjectionMatrixLoc, false, flatten(projectionMatrix));
    }

    // Update lighting and material uniforms (excluding uLightDir)
    function updateLightingAndMaterial() {
        gl.uniform1f(uLeAmbientLoc, LeAmbient);   // Set uLeAmbient as float
        gl.uniform1f(uKdLoc, kd);
        gl.uniform1f(uKsLoc, ks);
        gl.uniform1f(uShininessLoc, shininess);
        gl.uniform3fv(uLeLoc, flatten(Le));       // Set uLe as vec3
        // Note: uLightDir is set in the render function
    }

    // Render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Update camera position if orbiting
        if (orbiting) {
            alpha += deltaAlpha;
            if (alpha > 2 * Math.PI) alpha -= 2 * Math.PI;
        }

        // Compute eye position
        var eye = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        var at = vec3(0.0, 0.0, 0.0);
        var up = vec3(0.0, 1.0, 0.0);

        // Compute modelViewMatrix with lookAt
        modelViewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(modelViewMatrix));

        // Compute the normal matrix (upper-left 3x3 of the model-view matrix)
        normalMatrix = [
            vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
            vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
            vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
        ];
        // Since there's no scaling, the normal matrix is just the rotation part
        gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(normalMatrix));

        // Transform the light direction to eye space
        var lightDirEye = vec3(mult(modelViewMatrix, vec4(lightDir, 0.0)));
        lightDirEye = normalize(lightDirEye); // Ensure it's normalized
        gl.uniform3fv(uLightDirLoc, flatten(lightDirEye)); // Set uLightDir

        // Bind and set vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(aPositionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPositionLoc);

        // Bind and set normals
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormalLoc);

        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Setup event listeners for buttons and sliders
    function setupControls() {
        // Subdivision buttons
        var incButton = document.getElementById('increase-subdivision');
        var decButton = document.getElementById('decrease-subdivision');

        incButton.addEventListener('click', function() {
            if (NumTimesToSubdivide < 8) { // Limit subdivision level
                NumTimesToSubdivide++;
                initSphere();
            }
        });

        decButton.addEventListener('click', function() {
            if (NumTimesToSubdivide > 0) { // Prevent negative subdivisions
                NumTimesToSubdivide--;
                initSphere();
            }
        });

        // Orbiting button
        var toggleOrbitButton = document.getElementById('toggle-orbit');
        toggleOrbitButton.addEventListener('click', function() {
            orbiting = !orbiting;
            toggleOrbitButton.textContent = orbiting ? 'Stop Orbiting' : 'Start Orbiting';
        });

        // Depth Testing Toggle
        var toggleDepthButton = document.getElementById('toggle-depth-testing');
        toggleDepthButton.addEventListener('click', function() {
            depthTestingEnabled = !depthTestingEnabled;
            if (depthTestingEnabled) {
                gl.enable(gl.DEPTH_TEST);
                toggleDepthButton.textContent = 'Disable Depth Testing';
            } else {
                gl.disable(gl.DEPTH_TEST);
                toggleDepthButton.textContent = 'Enable Depth Testing';
            }
        });

        // Back-Face Culling Toggle
        var toggleCullingButton = document.getElementById('toggle-culling');
        toggleCullingButton.addEventListener('click', function() {
            cullingEnabled = !cullingEnabled;
            if (cullingEnabled) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK); // Cull back faces
                gl.frontFace(gl.CCW); // Define front faces as counter-clockwise
                toggleCullingButton.textContent = 'Disable Back-Face Culling';
            } else {
                gl.disable(gl.CULL_FACE);
                toggleCullingButton.textContent = 'Enable Back-Face Culling';
            }
        });

        // Sliders
        // Ambient Radiance (LeAmbient)
        var leAmbientSlider = document.getElementById('leAmbient-slider');
        var leAmbientValueSpan = document.getElementById('leAmbient-value');
        leAmbientSlider.addEventListener('input', function() {
            LeAmbient = parseFloat(leAmbientSlider.value);
            leAmbientValueSpan.textContent = LeAmbient.toFixed(2);
            gl.uniform1f(uLeAmbientLoc, LeAmbient);
        });

        // Diffuse Coefficient (kd)
        var kdSlider = document.getElementById('kd-slider');
        var kdValueSpan = document.getElementById('kd-value');
        kdSlider.addEventListener('input', function() {
            kd = parseFloat(kdSlider.value);
            kdValueSpan.textContent = kd.toFixed(2);
            gl.uniform1f(uKdLoc, kd);
        });

        // Specular Coefficient (ks)
        var ksSlider = document.getElementById('ks-slider');
        var ksValueSpan = document.getElementById('ks-value');
        ksSlider.addEventListener('input', function() {
            ks = parseFloat(ksSlider.value);
            ksValueSpan.textContent = ks.toFixed(2);
            gl.uniform1f(uKsLoc, ks);
        });

        // Shininess (s)
        var shininessSlider = document.getElementById('shininess-slider');
        var shininessValueSpan = document.getElementById('shininess-value');
        shininessSlider.addEventListener('input', function() {
            shininess = parseFloat(shininessSlider.value);
            shininessValueSpan.textContent = shininess.toFixed(0);
            gl.uniform1f(uShininessLoc, shininess);
        }); 

        // Light Emission (Le)
        var leSlider = document.getElementById('le-slider');
        var leValueSpan = document.getElementById('le-value');
        leSlider.addEventListener('input', function() {
            var LeValue = parseFloat(leSlider.value);
            Le = vec3(LeValue, LeValue, LeValue); // Update Le as vec3
            leValueSpan.textContent = LeValue.toFixed(2);
            gl.uniform3fv(uLeLoc, flatten(Le)); // Set uLe as vec3
        });
    }

    // Initialize everything
    init();
};