// src/utils/utils.js

/**
 * Flatten a vector, an array of vectors, or a 4x4 matrix into a Float32Array
 * suitable for gl.bufferData / gl.uniformMatrix4fv.
 *
 * WebGL only accepts typed arrays, so this must return a Float32Array (the
 * previous version returned a plain Array, which silently uploaded no data).
 * Matrices (tagged with `.matrix === true`) are transposed to column-major,
 * matching how Edward Angel's MV.js behaves.
 *
 * @param {Array} v A 1D array of numbers, an array of vectors, or a matrix.
 * @returns {Float32Array}
 */
export function flatten(v) {
    if (!Array.isArray(v)) {
        console.error('flatten: input is not an array:', v);
        return new Float32Array(0);
    }

    // Matrix: transpose row-major -> column-major for WebGL.
    if (v.matrix === true) {
        const n = v.length;
        const out = new Float32Array(n * n);
        let idx = 0;
        for (let col = 0; col < n; ++col) {
            for (let row = 0; row < n; ++row) {
                out[idx++] = v[row][col];
            }
        }
        return out;
    }

    // Array of vectors: concatenate components.
    if (Array.isArray(v[0])) {
        const inner = v[0].length;
        const out = new Float32Array(v.length * inner);
        let idx = 0;
        for (let i = 0; i < v.length; ++i) {
            for (let j = 0; j < v[i].length; ++j) {
                out[idx++] = v[i][j];
            }
        }
        return out;
    }

    // Plain 1D array of numbers.
    return new Float32Array(v);
}
