// W01P3.js
import React, { useEffect, useRef } from 'react';
import { initShaders, vec2, vec3, flatten, setupWebGL } from '../../../utils';

const W01P3 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    // Define the coordinates of the triangle's vertices
    const vertices = [
      vec2(0.0, 0.0),  // Vertex 1
      vec2(1.0, 0.0),  // Vertex 2
      vec2(1.0, 1.0)   // Vertex 3
    ];

    // Define the colors for each vertex
    const colors = [
      vec3(1.0, 0.0, 0.0),
      vec3(0.0, 1.0, 0.0),
      vec3(0.0, 0.0, 1.0)
    ];

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec4 vPosition;
      attribute vec3 vColor;
      varying vec3 fColor;

      void main() {
          gl_Position = vPosition;
          fColor = vColor;
      }
    `;

    // Fragment Shader
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 fColor;

      void main() {
          gl_FragColor = vec4(fColor, 1.0);
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

    // Load the color data into the GPU
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
  }, []);

  return (
    <canvas ref={canvasRef} width="512" height="512" className="mx-auto" />
  );
};

export default W01P3;