// W01P1.js
import React, { useEffect, useRef } from 'react';
import { setupWebGL } from '../../../utils'; // Correct import path

const W01P1 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Get the canvas element using the ref
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize the WebGL context
    const gl = setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
      return;
    }

    // Configure the viewport to match the canvas dimensions
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the clear color to cornflower blue
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    // Clear the canvas with the specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Cleanup function to handle context loss (optional)
    return () => {
      // Perform any cleanup, like deleting buffers or programs
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <canvas ref={canvasRef} width="512" height="512" className="mx-auto" />
  );
};

export default W01P1;