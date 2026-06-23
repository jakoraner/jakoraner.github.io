window.onload = function init() {
  // Get the WebGL rendering context
  var canvas = document.getElementById('gl');
  var gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert('WebGL is not available');
  }

  // Define the vertices of the cube (from (0,0,0) to (1,1,1))
  var vertices = [
    vec3(0.0, 0.0, 0.0), // v0x
    vec3(1.0, 0.0, 0.0), // v1
    vec3(1.0, 1.0, 0.0), // v2
    vec3(0.0, 1.0, 0.0), // v3
    vec3(0.0, 0.0, 1.0), // v4
    vec3(1.0, 0.0, 1.0), // v5
    vec3(1.0, 1.0, 1.0), // v6
    vec3(0.0, 1.0, 1.0)  // v7
  ];

  // Define the indices for the wireframe of the cube
  var wireIndices = [
    0, 1, 1, 2, 2, 3, 3, 0, // Bottom face edges
    4, 5, 5, 6, 6, 7, 7, 4, // Top face edges
    0, 4, 1, 5, 2, 6, 3, 7  // Side edges
  ];

  // Initialize shader program using shaders from HTML
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create buffers
  var vBuffer = gl.createBuffer();
  var iBuffer = gl.createBuffer();

  // Load the vertex data into the GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate vertex data with shader variables
  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Load the index data into the GPU
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireIndices), gl.STATIC_DRAW);

  // Compute aspect ratio
  var aspect = canvas.width / canvas.height;

  // Create the projection matrix using Angel's functions
  var projectionMatrix = ortho(-1.5 * aspect, 1.5 * aspect, -1.5, 1.5, -10, 10);

  // Create the model-view matrix
  var modelViewMatrix = mat4(); // Identity matrix

  // Center the cube at the origin
  var translateMatrix = translate(-0.5, -0.5, -0.5);
  modelViewMatrix = mult(translateMatrix, modelViewMatrix);

  // Rotate 45 degrees around Y-axis
  var rotateYMatrix = rotateY(45);
  modelViewMatrix = mult(rotateYMatrix, modelViewMatrix);

  // Rotate 35.264 degrees around X-axis for isometric view
  var rotateXMatrix = rotateX(35.264);
  modelViewMatrix = mult(rotateXMatrix, modelViewMatrix);

  // Pass the projection and model-view matrices to the shader
  var projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  var modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // Clear the canvas and set the viewport
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0); // Cornflower blue
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);

  // Draw the cube using lines
  gl.drawElements(gl.LINES, wireIndices.length, gl.UNSIGNED_SHORT, 0);
};