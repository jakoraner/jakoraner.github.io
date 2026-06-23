/**
 * @module MV.js
 * @description Provides utility functions for matrix and vector operations,
 * specifically designed for use in WebGL applications. It includes functions
 * for creating 4x4 matrices, vector operations, transformations (translate,
 * rotate), and other helper functions.
 */

// Define all functions and variables here

/**
 * Creates a new 4x4 matrix.
 *
 * @returns {mat4} A new 4x4 matrix initialized to the identity matrix.
 */
export function mat4() {
    var out = new Array(4);
    for (var i = 0; i < 4; ++i) {
        out[i] = new Array(4);
    }

    out[0][0] = out[1][1] = out[2][2] = out[3][3] = 1.0;
    out[0][1] = out[0][2] = out[0][3] = out[1][0] = out[1][2] = out[1][3] = out[2][0] = out[2][1] = out[2][3] = out[3][0] = out[3][1] = out[3][2] = 0.0;

    return out;
}

export function vec2(x, y) {
    if (typeof x === "object" && x.length == 2) {
        return x;
    }
    var out = [];
    out.push(x);
    out.push(y);
    return out;
};

export function vec3(x, y, z) {
    if (typeof x === "object" && x.length == 3) {
        return x;
    }
    var out = [];
    out.push(x);
    out.push(y);
    out.push(z);
    return out;
};

export function vec4(x, y, z, w) {
    if (typeof x === "object" && x.length == 4) {
        return x;
    }
    var out = [];
    out.push(x);
    out.push(y);
    out.push(z);
    out.push(w);
    return out;
};

export function translate(x, y, z) {
    if (Array.isArray(x) && x.length == 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
};

export function rotate(angle, axis) {
    if (!Array.isArray(axis)) {
        axis = [arguments[1], arguments[2], arguments[3]];
    }

    var v = normalize(axis);

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos(radians(angle));
    var omc = 1.0 - c;
    var s = Math.sin(radians(angle));

    var result = mat4(
        vec4(x * x * omc + c, x * y * omc - z * s, x * z * omc + y * s, 0.0),
        vec4(x * y * omc + z * s, y * y * omc + c, y * z * omc - x * s, 0.0),
        vec4(x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c, 0.0),
        vec4()
    );

    return result;
};

export function normalize(vec, excludeLastComponent) {
    if (vec.type === "vec3") {
        excludeLastComponent = false;
    }

    if (vec.type === "vec4") {
        excludeLastComponent = true;
    }

    var last;

    if (excludeLastComponent) {
        last = vec.pop();
    }

    var len = length(vec);

    if (!isFinite(len)) {
        throw "normalize: vector " + vec + " has zero length";
    }

    for (var i = 0; i < vec.length; ++i) {
        vec[i] /= len;
    }

    if (excludeLastComponent) {
        vec.push(last);
    }

    return vec;
};

export function length(vec) {
    var len = 0.0;
    for (var i = 0; i < vec.length; ++i) {
        len += vec[i] * vec[i];
    }
    return Math.sqrt(len);
};

export function radians(degrees) {
    return (degrees * Math.PI) / 180.0;
};

// Helper function to copy array values
export function copyArray(src, dest) {
    for (var i = 0; i < src.length; ++i) {
        dest[i] = src[i];
    }
}

export function isEqual(a, b) {
    if (a.length != b.length) {
        return false;
    }

    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i]) {
            return false;
        }
    }

    return true;
};

// Example of exporting an object containing all functions
export default {
    mat4,
    vec2,
    vec3,
    vec4,
    translate,
    rotate,
    normalize,
    length,
    radians,
    copyArray,
    isEqual
};