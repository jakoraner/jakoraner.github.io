// W01P5.js
import React, { useEffect, useRef } from 'react';
import { initShaders, vec2, vec4, flatten, translate, setupWebGL } from '../../../utils';

const W01P5 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    // Number of points to create the circle
    const numSegments = 100;

    // Define the radius of the circle
    const radius = 0.5;

    // Define the center of the circle (initially at origin)
    const center = vec2(0.0, 0.0);

    // Generate the vertices for the circle using triangle fan
    const vertices = [];
    vertices.push(center); // Center point of the fan

    for (let i = 0; i <= numSegments; i++) {
      const angle = 2 * Math.PI * i / numSegments;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      vertices.push(vec2(x, y));
    }

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 vPosition;
      uniform mat4 translation;

      void main() {
          vec4 pos = vec4(vPosition, 0.0, 1.0);
          gl_Position = translation * pos;
      }
    `;

    // Fragment Shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 uColor;

      void main() {
          gl_FragColor = uColor;
      }
    `;

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0); // Cornflower blue

    // Load shaders and initialize attribute buffers
    const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    // Load the vertex data into the GPU
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Get the location of the translation uniform
    const translationLoc = gl.getUniformLocation(program, "translation");

    // Get the location of the color uniform
    const colorLoc = gl.getUniformLocation(program, "uColor");

    // Initial parameters for bouncing
    let yPos = 0.0;
    let direction = 1.0; // 1.0 for up, -1.0 for down
    let speed = 0.01;    // Adjust this value for speed of bouncing
    let maxY = 0.5;      // Maximum y position
    let minY = -0.5;     // Minimum y position

    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update the y position for bouncing
      yPos += direction * speed;
      if (yPos > maxY) {
        yPos = maxY;
        direction = -1.0; // Change direction to down
      } else if (yPos < minY) {
        yPos = minY;
        direction = 1.0; // Change direction to up
      }

      // Create the translation matrix
      const translation = translate(0.0, yPos, 0.0);

      // Send the translation matrix to the shader
      gl.uniformMatrix4fv(translationLoc, false, flatten(translation));

      // Set the color to white
      gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1.0));

      // Draw the circle using triangle fan
      gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

      // Request another frame
      requestAnimationFrame(render);
    }

    // Start the animation loop
    render();
  }, []);

  return (
    <canvas ref={canvasRef} width="512" height="512" className="mx-auto" />
  );
};

export default W01P5;