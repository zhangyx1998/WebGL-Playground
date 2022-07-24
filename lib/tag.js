export default function TAG(type) {
	return (strings, ...args) => {
		const content = strings.reduce(
			(str, cur, i) => str + cur + (args[i]?.toString() || ''),
			''
		);
		return `<${type}>${content
			}</${type}>`
	}
}
