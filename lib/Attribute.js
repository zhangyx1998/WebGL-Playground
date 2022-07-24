// Utility function
const PANIC = (messages, ...args) => {
	const message = messages.reduce(
		(str, el, i) => str + el + (args?.[i]?.toString() ?? ''), ''
	)
	throw new Error(message);
}
/**
 * @typedef {Object | number} AttributeMeta
 * @property {number} size
 * @property {boolean?} normalize
 * @property {number?} stride
 * How many bytes to get from one set of values to the next.
 * If set to 0, use size * unitSize.
 * @property {number?} offset
 */

/**
 * @typedef {Function} AttributeConstructor
 * @param {string} name
 */

export default class Attribute {
	/** @type {number} Size of typed array element */
	get unitSize() { throw new Error; return 0; }
	// Name of the attribute, must agree with the
	// one declared in your shader.
	#name;
	get name() { return this.#name; }
	/**
	 * The actual data to be used, can be updated according to your needs
	 * @type {ArrayBufferView}
	 */
	#data;
	get data() { return this.#data ?? PANIC`data not initialized`; }
	get buffer() { return this.data?.buffer; }
	get count() { return (this.buffer.byteLength / this.stride) | 0 }
	// Accessible properties
	// Pointer configurations
	#type;
	get type() { return this.#type; }
	/**
	 * @type {number}
	 * Number of elements per vertex.
	 * AKA. numComponents
	 * */
	#size;
	get size() { return this.#size; }
	/**
	 * @type {boolean}
	 * Whether the vector should be normalized;
	 */
	#normalize;
	get normalize() { return this.#normalize; }
	/**
	 * @type {number}
	 * Bytes from start of one vertex to next vertex.
	 * AKA. numComponents
	 * */
	#stride;
	get stride() { return this.#stride || this.size * this.unitSize; }
	/**
	 * @type {number}
	 * How many bytes inside the buffer to start from
	 * */
	#offset;
	get offset() { return this.#offset; }
	/**
	 * Abstract class constructor
	 * @param {'INT' | 'FLOAT' | 'BOOL'} type
	 * Type of the array elements
	 * @param {string} name
	 * Name of the attribute
	 * @param {AttributeMeta} meta
	 * Attribute metadata
	 */
	constructor(type = 'FLOAT', name, meta) {
		// Normalize name
		if (typeof name !== 'string' || !name) throw new TypeError;
		this.#name = name;
		// Normalize attribute type
		if (typeof type !== 'string') throw new TypeError;
		type = type.toUpperCase();
		switch (type) {
			case 'INT':
			case 'BOOL':
			case 'FLOAT':
				this.#type = type;
				break;
			default:
				PANIC`Unsupported type: ${type}`;
		}
		// Normalize metadata
		if (typeof meta === 'number') meta = { size: meta };
		const { size, normalize, stride, offset } = meta || {};
		this.#size = size ?? PANIC`Attribute size not defined`;
		this.#normalize = normalize ?? false;
		this.#stride = stride;
		this.#offset = offset ?? 0;
	}
	/**
	 * Update (or initialize) the attribute data array.
	 * @param {Array} data the data to be stored
	 * @returns {Attribute}
	 */
	assign(data) {
		this.#data = data;
		return this;
	}
	/**
	 * Apply current attribute as the only attribute.
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLProgram} program 
	 */
	apply(ctx, program) {
		ctx.bufferData(ctx.ARRAY_BUFFER, this.buffer, ctx.STATIC_DRAW);
		this.setupPointer(ctx, program, 0);
		return this.count;
	}
	/**
	 * Setup attribute pointer.
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLProgram} program 
	 * @param {number?} globalOffset
	 */
	setupPointer(ctx, program, globalOffset = 0) {
		const
			index = ctx.getAttribLocation(program, this.name),
			{ size, type, normalize, stride, offset } = this;
		ctx.vertexAttribPointer(
			index, size, ctx[type], normalize, stride, offset + globalOffset
		);
		ctx.enableVertexAttribArray(index);
	}
	/**
	 * Synthesis list of attributes.
	 * @param {WebGL2RenderingContext} ctx 
	 * @param {WebGLProgram} program 
	 * @param {Attribute[]} params 
	 * @returns {number} Count of vertex instances
	 */
	static synthesis(ctx, program, params) {
		// Check number of attributes
		if (!Array.isArray(params)) throw new TypeError;
		// Pick out all attribute instances
		const attributes = params.filter(el => el instanceof Attribute);
		if (attributes.length === 0) return 0;
		if (attributes.length === 1) return attributes[0].apply(ctx, program);
		// build combined buffer
		const
			buffer = new Uint8Array(
				attributes.reduce((size, attr) => size + attr.buffer.byteLength, 0)
			),
			{ count } = attributes.reduce(
				({ offset, count }, attr) => {
					// Write attribute buffer into shared buffer
					buffer.set(attr.buffer, offset);
					// Setup attribute buffer pointer
					attr.setupPointer(ctx, program, offset);
					// Increment buffer pointer
					offset += attr.buffer.byteLength;
					// Re-evaluate count
					count = Math.min(count, attr.count);
					// Iterate
					return { offset, count };
				},
				{ offset: 0, count: Infinity }
			);
		// Use the newly created buffer
		ctx.bufferData(ctx.ARRAY_BUFFER, buffer, ctx.STATIC_DRAW);
		// Return count of vertex instances
		return count;
	}
}

export class Float32Attribute extends Attribute {
	get unitSize() { return 4 /* bytes */; }
	constructor(name, meta) { super('FLOAT', name, meta); }
	assign(data) {
		if (!(Symbol.iterator in data)) throw new TypeError;
		super.assign(
			data instanceof Float32Array
				? data
				: new Float32Array(data)
		);
	}
}