// W01P4.js
import React, { useEffect, useRef } from 'react';
import { initShaders, vec2, vec4, flatten, rotate, setupWebGL } from '../../../utils';

const W01P4 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    // Define the coordinates of the square's vertices (as vec2)
    const vertices = [
      vec2(-0.5, -0.5),  // Vertex 0
      vec2(0.5, -0.5),   // Vertex 1
      vec2(0.5, 0.5),    // Vertex 2
      vec2(-0.5, -0.5),  // Vertex 0
      vec2(0.5, 0.5),    // Vertex 2
      vec2(-0.5, 0.5)    // Vertex 3
    ];

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 vPosition;
      uniform mat4 rotation;

      void main() {
          vec4 pos = vec4(vPosition, 0.0, 1.0);
          gl_Position = rotation * pos;
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
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Get the location of the rotation uniform
    const rotationLoc = gl.getUniformLocation(program, "rotation");

    // Get the location of the color uniform
    const colorLoc = gl.getUniformLocation(program, "uColor");

    let theta = 0.0;

    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update the rotation angle
      theta += 1.0; // degrees
      if (theta > 360.0) theta -= 360.0;

      // Create the rotation matrix
      const rotation = rotate(theta, [0, 0, 1]);

      // Send the rotation matrix to the shader
      gl.uniformMatrix4fv(rotationLoc, false, flatten(rotation));

      // Set the color to white
      gl.uniform4fv(colorLoc, vec4(1.0, 1.0, 1.0, 1.0));

      // Draw the square (two triangles)
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

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

export default W01P4;