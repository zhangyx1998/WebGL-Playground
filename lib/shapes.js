export function* quadrilateral(X1, Y1, X2, Y2, X3, Y3, X4, Y4) {

}
/**
 * Vertex for drawing a rectangle
 * @param {number} X1 Coordinate X1
 * @param {number} Y1 Coordinate Y1
 * @param {number} X2 Coordinate X2
 * @param {number} Y2 Coordinate Y2
 * @return {Iterable}
 */
export function* rectangle(X1, Y1, X2, Y2) {
	yield X1; yield Y1;
	yield X2; yield Y1;
	yield X1; yield Y2;
	yield X2; yield Y2;
}
/**
 * 
 * @param {number} X1 Coordinate X1
 * @param {number} Y1 Coordinate Y1
 * @param {number} X2 Coordinate X2
 * @param {number} Y2 Coordinate Y2
 * @param {number} W Width of border
 */
export function* box(X1, Y1, X2, Y2, W) {
	/**
	 * Normalize the coordinates as follows:
	 * -------------------------------------
	 *          (X1, Y2)    (X2, Y2)
	 *             ┌──────────*
	 *             │          │
	 *             │          │
	 *             *──────────┘
	 *          (X1, Y1)    (X2, Y1)
	 * -------------------------------------
	 */
	[X1, X2] = X1 > X2 ? [X2, X1] : [X1, X2];
	[Y1, Y2] = Y1 > Y2 ? [Y2, Y1] : [Y1, Y2];
	// The offset (D) from line center to line border
	const D = W / 2;
	// The actual corner points
	const
		[X1A, X1B] = [X1 - D, X1 + D],
		[Y1A, Y1B] = [Y1 - D, Y1 + D],
		[X2A, X2B] = [X2 + D, X2 - D],
		[Y2A, Y2B] = [Y2 + D, Y2 - D];
	// Start point
	yield X1B; yield Y1B;
	yield X1A; yield Y1A;
	// Bottom Side
	yield X2B; yield Y1B;
	yield X2A; yield Y1A;
	// Right Side
	yield X2B; yield Y2B;
	yield X2A; yield Y2A;
	// Top Side
	yield X1B; yield Y2B;
	yield X1A; yield Y2A;
	// Left Side
	yield X1B; yield Y1B;
	yield X1A; yield Y1A;
}
/**
 * Close a shape, clear its connection to other shapes.
 * @param {Iterable} shape The shape to be closed
 * @returns {Iterable}
 */
export function* close(shape) {
	let p = 0 | 0;
	const buf = [0, 0];
	for (const val of shape) {
		yield buf[p & 1] = val;
		if (++p == 2) {
			// Re-yield the first two values
			yield buf[0];
			yield buf[1];
		}
	}
	yield buf[0];
	yield buf[1];
}
/**
 * Create an array of given shape
 * @param {Iterable} shape The shape to be repeated
 * @param {[x: number, y: number]} origin 
 * @param {[x: number, y: number]} step 
 * @param {[x: number, y: number]} dup 
 * @returns {Iterable}
 */
export function* array(
	shape,
	origin = [0, 0],
	step = [0, 0],
	dup = [1, 1]
) {
	// Instantiate the shape if its an iterator
	const _shape = [...close(shape)];
	// Loop through all duplicates
	for (let i = 0; i < dup[0]; i++) {
		for (let j = 0; j < dup[1]; j++) {
			const offset = [
				origin[0] + step[0] * i,
				origin[1] + step[1] * j,
			]
			let f = 0 | 0;
			for (const val of _shape)
				yield val + offset[f++ & 1];
		}
	}
}
/**
 * Combine a list of shapes (closing each of them)
 * @param  {...Iterable} shapes 
 */
export function* combine(...shapes) {
	for (const shape of shapes) {
		for (const val of close(shape)) yield val;
	}
}