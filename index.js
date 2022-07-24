import getEl from './lib/getEl.js';
import prompt from './lib/error.js';
import v_src from './shaders/plain_rectangle/vert.glsl';
import f_src from './shaders/plain_rectangle/frag.glsl';
import * as WebGL from './lib/WebGL.js';
import * as Shape from './lib/shapes.js'
import { Float32Attribute } from './lib/Attribute.js';
import * as Uniform from './lib/Uniform.js';
import TAG from './lib/tag.js';
import handleGesture, { normalizeScale } from './lib/gesture.js';
// Shape generators
// Initialize canvas and WebGL context
/** @type {HTMLCanvasElement} */
const canvas = await getEl('canvas');
// Display Holding message
prompt(TAG('h2')`Generating vertex data`);
// await new Promise(r => document.onload = r);
// Main logic
try {
	// Create context and gl program
	const
		{ ctx, program } = WebGL.init(canvas, v_src, f_src),
		// Initialize attributes and uniforms
		ratio = new Uniform.Float('ratio'),
		scale = new Uniform.Float('scale'),
		offset = new Uniform.Vec2('offset'),
		vertex = (new Float32Attribute('vertex', 2)),
		timeID = 'WebGL Graphic';
	// Generate vertex
	console.time(timeID);
	vertex.assign(
		Shape.combine(
			Shape.array(
				Shape.box(0.005, 0.005, 0.015, 0.015, 0.002),
				[-5, -5],
				[+0.02, +0.02],
				[500, 500]
			),
			Shape.box(+0.0, +0.0, +0.5, +0.5, 0.01),
			Shape.box(+0.0, +0.0, -0.9, -0.9, 0.01),
			Shape.box(-1.0, -1.0, +1.0, +1.0, 0.002),
			Shape.rectangle(+0.99, +0.99, +1.01, +1.01),
		)
	);
	console.timeLog(timeID, 'vertex generator ready');
	// First paint
	const update = WebGL.draw(
		ctx,
		program,
		ratio.assign(canvas.clientHeight / canvas.clientWidth),
		scale.assign(1),
		offset.assign(0, 0),
		vertex
	)
	console.timeLog(timeID, 'first paint');
	console.timeEnd(timeID);
	// Remove prompt
	prompt(null);
	// Scale and move animation
	let speed = 0.0005, x = 0;
	const startAnimation = (async () => {
		while (true) {
			offset.value = [
				Math.sin(x) + 0.2 * Math.cos(x * 10),
				Math.cos(x) + 0.2 * Math.sin(x * 10)
			];
			scale.value = Math.sin(x * 6) * 3 + 3.1;
			x += speed;
			requestAnimationFrame(() => update());
			await new Promise(r => setTimeout(r, 0));
		}
	})
	// Scale event listener
	const state = { x: 0, y: 0, scale: 0.0 };
	// canvas.addEventListener('hov', console.log)
	canvas.addEventListener('wheel', event => {
		event.preventDefault();
		// console.log(...Object.values(state));
		handleGesture(canvas, state, event);
		offset.assign(state.x, state.y);
		scale.assign(normalizeScale(state.scale));
		// console.log(state.scale, Math.exp(state.scale));
		update();
	})
	// Quick reset canvas
	function resetCanvas() {
		state.x = state.y = 0;
		state.scale = 0;
		offset.assign(state.x, state.y);
		scale.assign(normalizeScale(state.scale));
		update();
	}
	canvas.addEventListener('click', event => {
		if (event.metaKey || event.ctrlKey || event.altKey) {
			event.preventDefault()
			resetCanvas()
		}
	})
	window.addEventListener('resize', () => update())
	// Expose necessary components
	Object.assign(window, {
		Shape, WebGL,
		canvas, ctx, program, update,
		scale, offset, vertex,
		ratio, state, startAnimation, speed,
		resetCanvas
	})
} catch (e) {
	prompt(e.message)
	throw e;
}