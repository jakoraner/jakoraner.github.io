// src/utils/initShaders.js
/**
 * @module initShaders.js
 * @description Provides functions to initialize shaders for WebGL applications.
 * It supports loading shaders from script tags or strings, compiling them,
 * and linking them into a shader program.
 */

/**
 * Creates a shader of the given type, uploads the source, and compiles it.
 *
 * @param {WebGLRenderingContext} gl The WebGL context.
 * @param {number} type The type of the shader, either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param {string} source The GLSL source code for the shader.
 * @returns {WebGLShader} The compiled shader.
 * @throws {Error} If the shader fails to compile.
 */
export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const errorMsg = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shader: " + errorMsg);
    }

    return shader;
}

/**
 * Initializes and links a shader program from provided vertex and fragment shader sources.
 *
 * @param {WebGLRenderingContext} gl The WebGL context.
 * @param {string} vertexShaderSource The GLSL source code for the vertex shader.
 * @param {string} fragmentShaderSource The GLSL source code for the fragment shader.
 * @returns {WebGLProgram} The linked shader program.
 * @throws {Error} If an error occurs during the creation, compilation, or linking of the shader program.
 */
export function initShaders(gl, vertexShaderSource, fragmentShaderSource) {
    try {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            const errorMsg = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error("Unable to initialize the shader program: " + errorMsg);
        }

        return program;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Example of exporting an object containing all functions
export default {
    createShader,
    initShaders
};