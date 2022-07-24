import TAG from "./tag.js";
import Attribute from './Attribute.js';
import Uniform from "./Uniform.js";
/**
 * Compile and register vert/frag shader source
 * @param {WebGL2RenderingContext} ctx
 * @param {number} type
 * @param {string} source
 * @returns {undefined | string}
 * Optional error message
 */
function useShader(ctx, type, source) {
	// Create a new shader instance
	const shader = ctx.createShader(type);
	// Add source to the shader instance
	ctx.shaderSource(shader, source);
	// Compile the shader from above added source
	ctx.compileShader(shader);
	// Check if shader compiled correctly
	return ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)
		// Compile successful
		? shader
		// Compile unsuccessful
		: new Error(ctx.getShaderInfoLog(shader))
}
/**
 * Initialize WebGL context and shader for given canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {string} v_src Vertex shader source
 * @param {string} f_src Fragment shader source
 * @returns 
 */
export function init(canvas, v_src, f_src) {
	// Initialize canvas and WebGL context
	/** @type {WebGL2RenderingContext} */
	const ctx = undefined
		?? canvas.getContext('webgl2', { antialias: true })
		?? canvas.getContext('webgl2')
		?? canvas.getContext('webgl')
		?? canvas.getContext('experimental-webgl');
	// Load shaders into rendering context
	const shader = {
		vertex: useShader(ctx, ctx.VERTEX_SHADER, v_src),
		fragment: useShader(ctx, ctx.FRAGMENT_SHADER, f_src)
	};
	// Check for errors
	const errorMessage = Object.entries(shader).reduce(
		(pre, [key, val]) => pre += val instanceof Error
			? [
				TAG('h4')`Error compiling ${key} shader`,
				TAG('span')([val.message])
			].join('')
			: '',
		''
	)
	if (errorMessage) throw new Error(errorMessage);
	// Create shader program
	const program = ctx.createProgram();
	ctx.attachShader(program, shader.vertex);
	ctx.attachShader(program, shader.fragment);
	ctx.linkProgram(program);
	// Register the program to the currently active program
	ctx.useProgram(program);
	// Bind GL buffer
	ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
	// Enable depth testing
	ctx.enable(ctx.DEPTH_TEST);
	// Near things obscure far things
	ctx.depthFunc(ctx.LEQUAL);
	// Return initialized context and  GL program
	return { ctx, program }
}
/**
 * @param {WebGL2RenderingContext} ctx 
 */
function updateCoordinates(ctx) {
	const { canvas } = ctx;
	// Retrieve Device Pixel Ratio
	const dpr = window?.devicePixelRatio ?? 1;
	// Initialize canvas dimensions
	[
		canvas.height,
		canvas.width
	] = [
		canvas.clientHeight,
		canvas.clientWidth
	].map(x => x * dpr);
	// Set aspect ratio
	ctx.viewport(
		0, 0,
		ctx.drawingBufferWidth,
		ctx.drawingBufferHeight
	);
}
/**
 * Update the canvas with only uniform value updates
 * @param {WebGL2RenderingContext} ctx 
 * @param {WebGLProgram} program 
 * @param {(
 * 	(ctx: WebGLRenderingContext, program: WebGLProgram) => undefined
 * )[]} uniforms
 * @param {number} count Count of vertexes
 */
function drawWithUniforms(ctx, program, params, count) {
	updateCoordinates(ctx);
	// Apply uniform values to rendering context
	Uniform.apply(ctx, program, params);
	// Clear the canvas with given color
	ctx.clearColor(0.0, 0.0, 0.0, 1.0);
	// Clear everything
	ctx.clearDepth(1.0);
	// Clear on-canvas objects
	ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
	// Draw the elements
	ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, count);
}
/**
 * Draw a frame according to given data
 * @param {WebGL2RenderingContext} ctx 
 * @param {WebGLProgram} program 
 * @param {((ctx: WebGLRenderingContext, program: WebGLProgram) => undefined)[]} uniforms
 * @param {Attribute[]} attributes
 * @returns {(FULL_UPDATE: boolean) => undefined} count of vertexes
 */
export function draw(ctx, program, ...args) {
	const params = args.flat(Infinity);
	// Setup attributes and return the vertex instance count
	let count;
	// Return count of vertexes
	const update = (FULL_UPDATE = false) => {
		// Remake attribute buffers if necessary
		if (FULL_UPDATE || count === undefined) {
			count = Attribute.synthesis(ctx, program, params);
		}
		// Initialize or update uniform values and canvas status
		drawWithUniforms(ctx, program, params, count);
	};
	// Run full update at first draw
	update(true);
	return update;
}