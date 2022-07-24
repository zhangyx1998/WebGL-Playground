export function normalizeScale(val) {
	return val > 0
		? val ** 2 + + val + 1.0
		: Math.exp(val)
}
/**
 * Calculate new state given a wheel event
 * @param {{
 * 	x: number,
 * 	y: number,
 * 	scale: number
 * }} state 
 * @param {WheelEvent} event 
 */
export default function handleGesture(canvas, state, event) {
	const
		{ deltaX, deltaY, wheelDelta, ctrlKey, altKey, offsetX, offsetY } = event,
		{ clientHeight, clientWidth } = canvas,
		currentScale = normalizeScale(state.scale);
	// Check control key
	if (!ctrlKey) {
		// Move
		state.x -= deltaX / (clientWidth * currentScale);
		state.y += deltaY / (clientHeight * currentScale);
	} else {
		// Zoom
		const
			scale = state.scale + wheelDelta / (altKey ? 10000 : 4000),
			targetScale = normalizeScale(scale),
			// Mouse position when event is triggered (-1.0 - 1.0)
			mX = (2 * offsetX / clientWidth - 1),
			mY = (1 - 2 * offsetY / clientHeight),
			// Current and target normalized scale
			dS = (targetScale - currentScale) / (targetScale * currentScale);
		// Write new state
		state.scale = scale;
		// Update offset as if the zoom is centered at mouse position
		state.x -= mX * dS;
		state.y -= mY * dS;
	}
}