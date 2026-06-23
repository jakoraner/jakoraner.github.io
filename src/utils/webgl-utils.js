/*  Adapted from:
 *  WebGLUtils (c) 2010-2023 Google Inc.
 *  The Google WebGL প্রকল্পটি এই কোডটি প্রকাশ করেছে
 *  একটি Apache-স্টাইল লাইসেন্সের অধীনে নীচে তালিকাভুক্ত করা হয়েছে।
 */

/**
 * @module webgl-utils.js
 * @description Provides utility functions for WebGL setup and context management,
 * including a fallback mechanism for older browsers without native WebGL support.
 */

/**
 * Initializes a WebGL context for the given canvas. Falls back to "experimental-webgl"
 * for older browsers, and throws an error if WebGL context creation fails.
 *
 * @param {HTMLCanvasElement} canvas The canvas element to initialize the WebGL context on.
 * @param {Object} [options] Options to pass to the getContext call.
 * @returns {WebGLRenderingContext} The initialized WebGL rendering context.
 * @throws {Error} If a WebGL context cannot be initialized.
 */
export function setupWebGL(canvas, options) {
  function fallbackWebGLContext() {
      throw new Error("WebGL context creation failed.");
  }

  if (!window.WebGLRenderingContext) {
      fallbackWebGLContext();
  }

  const contextNames = ["webgl", "experimental-webgl"];
  let ctx = null;

  for (let i = 0; i < contextNames.length; ++i) {
      try {
          ctx = canvas.getContext(contextNames[i], options);
          if (ctx) {
              break;
          }
      } catch (e) {
          // Context creation failed, continue to next name
      }
  }

  if (!ctx) {
      fallbackWebGLContext();
  }

  return ctx;
}

// Example of exporting an object containing all functions
export default {
  setupWebGL
};