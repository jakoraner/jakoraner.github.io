import React, { useEffect, useRef, useState } from 'react';
import { initShaders, vec2, flatten, setupWebGL } from '../../../utils';

const W01P2 = () => {
  const canvasRef = useRef(null);
  const [glContext, setGlContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!glContext) {
      const gl = setupWebGL(canvas);
      if (!gl) {
        alert("WebGL isn't available");
        return;
      }
      setGlContext(gl);
    }
  }, [canvasRef, glContext]);

  useEffect(() => {
    if (!glContext || !canvasRef.current) return;

    const gl = glContext;
    const canvas = canvasRef.current;

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec4 vPosition;

      void main() {
          gl_Position = vPosition;
          gl_PointSize = 20.0;
      }
    `;

    // Fragment Shader
    const fragmentShaderSource = `
      precision mediump float;

      void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black color
      }
    `;

    // Initialize shaders
    const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);

    // Check for shader program creation errors
    if (!program) {
      console.error("Failed to create shader program");
      return;
    }

    gl.useProgram(program);

    // Define the coordinates of the three points
    const vertices = [
      vec2(0.0, 0.0),  // Point 1
      vec2(1.0, 0.0),  // Point 2
      vec2(1.0, 1.0)   // Point 3
    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0); // Cornflower blue

    // Load the data into the GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Flatten the vertices array before passing it to gl.bufferData
    const flattenedVertices = flatten(vertices);
    gl.bufferData(gl.ARRAY_BUFFER, flattenedVertices, gl.STATIC_DRAW);

    // Associate external shader variables with data buffer
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the points
    gl.drawArrays(gl.POINTS, 0, vertices.length);

    // Cleanup function
    return () => {
      gl.deleteBuffer(bufferId);
      gl.deleteProgram(program);
      // Any other cleanup as needed
    };
  }, [glContext]);

  return (
    <canvas ref={canvasRef} width="512" height="512" className="mx-auto" />
  );
};

export default W01P2;