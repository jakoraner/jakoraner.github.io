// src/utils/utils.js
export function flatten(matrix) {
    // Check if the input is an array before attempting to flatten
    if (!Array.isArray(matrix)) {
        console.error('Input is not an array:', matrix);
        return [];
    }

    // If it's already a 1D array, just return a copy to avoid modification of original array
    if (!Array.isArray(matrix[0])) {
        return matrix.slice();
    }

    // Flatten the 2D array into a 1D array
    return matrix.reduce(function(row, col) {
        return row.concat(Array.isArray(col) ? flatten(col) : col);
    }, []);
}