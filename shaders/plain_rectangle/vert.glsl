uniform vec2 offset;
uniform float scale;
uniform float ratio;
attribute vec2 vertex;
varying lowp vec3 color;

void main() {
	vec2 position = (vertex + offset) * scale;
	gl_Position = vec4(
		position.x * ratio,
		position.y,
		0,
		1
	);
	color = vec3(
		vertex.xy,
		- (vertex.x + vertex.y) / 2.0
	);
}
