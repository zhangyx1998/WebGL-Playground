varying lowp vec3 color;
void main() {
	gl_FragColor = vec4(
		color.rgb * 0.5 + vec3(0.5),
		1
	);
	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}