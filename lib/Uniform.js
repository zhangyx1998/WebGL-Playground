export default class Uniform {
	#name;
	get name() { return this.#name; }
	// Own data
	#value
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = this.normalize(value);
	}
	// Name is the only required field
	constructor(name) {
		this.#name = name;
	}
	/**
	 * Returns a callback to handle given value
	 * @param {...number} values
	 */
	assign(...values) {
		this.value = values.flat(Infinity);
		return this;
	}
	/**
	 * Apply current Uniform value to given context and program
	 * @param {WebGL2RenderingContext} ctx Rendering context
	 * @param {WebGLProgram} program 
	 * @param {number[]} values 
	 */
	apply(ctx, program) {
		const location = ctx.getUniformLocation(program, this.name);
		// Check if location is invalid
		if (location === null) console.warn(
			`Unable to locate ${this} in given program`
		);
		// Apply values to the given uniform location
		this.applyType(ctx, location);
	}
	/**
	 * Apply current Uniform value to given context and program
	 * @param {WebGL2RenderingContext} ctx Rendering context
	 * @param {WebGLUniformLocation} location 
	 * @param {number[]} vec 
	 */
	applyType(ctx, location) {
		console.warn('NOT IMPLEMENTED', this, value)
	}
	/**
	 * ABSTRACT METHOD DECLARATION
	 * Validate and transform uniform values.
	 * @param {number[]} vec 
	 */
	normalize(vec) {
		throw new SyntaxError(
			'Directly calling method normalize() within abstract class'
		)
	}
	/**
	 * Static method to apply all uniforms to given canvas
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLProgram} program 
	 * @param {Uniform[]} uniforms 
	 */
	static apply(ctx, program, uniforms) {
		uniforms
			.filter(el => el instanceof Uniform)
			.forEach(uniform => uniform.apply(ctx, program))
	}
	// toString overrides
	[Symbol.toStringTag]() {
		return this.toString();
	}
	toString() {
		return `${this.constructor.name}<${this.name}>`;
	}
}

class Vec extends Uniform {
	get NUM_VALUES() {
		throw new Error('NUM_VALUES not instantiated');
	}
	/** @param {number[]} vec */
	normalize(vec) {
		const { NUM_VALUES } = this;
		// Check type of warp array
		if (!Array.isArray(vec)) throw new TypeError;
		// Normalize number of values
		vec = vec.slice(0, NUM_VALUES);
		// Check number of elements
		if (vec.length !== NUM_VALUES) throw new TypeError;
		// Check for NaN
		if (vec.some(x => typeof x !== 'number' || Number.isNaN(x))) {
			throw new TypeError(`Vector contains NaN: ${vec}`);
		}
		// Return
		return vec;
	}
}

export class Vec2 extends Vec {
	get NUM_VALUES() { return 2; }
	/**
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLUniformLocation} location 
	 */
	applyType(ctx, location) {
		ctx.uniform2fv(location, this.value)
	}
}

export class Vec3 extends Vec {
	get NUM_VALUES() { return 3; }
	/**
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLUniformLocation} location
	 */
	applyType(ctx, location) {
		ctx.uniform3fv(location, this.value)
	}
}

export class Vec4 extends Vec {

}

export class Float extends Uniform {
	/** @param {number[]} vec */
	normalize(val) {
		if (Array.isArray(val)) [val] = val;
		// Check type of warp array
		if (typeof val !== 'number') throw new TypeError;
		// Check number of elements
		if (Number.isNaN(val)) throw new TypeError;
		// Return normalized value
		return val;
	}
	/**
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLUniformLocation} location
	 */
	applyType(ctx, location) {
		ctx.uniform1f(location, this.value)
	}
}

class Mat extends Uniform {
	get NUM_DIMENSIONS() {
		throw new Error('NUM_DIMENSIONS not instantiated');
	}
	/** @param {number[]} vec */
	normalize(vec) {
		const { NUM_DIMENSIONS } = this;
		// Check type of warp array
		if (!Array.isArray(vec)) throw new TypeError;
		// Normalize number of values
		vec = vec.slice(0, NUM_VALUES);
		// Check number of elements
		if (vec.length !== NUM_VALUES) throw new TypeError;
		// Check for NaN
		if (vec.some(x => typeof x !== 'number' || Number.isNaN(x))) {
			throw new TypeError(`Vector contains NaN: ${vec}`);
		}
		// Return
		return vec;
	}
}