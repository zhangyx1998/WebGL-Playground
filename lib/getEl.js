export default function getEl(id) {
	const el = document.getElementById(id);
	return el || new Promise(r => setTimeout(() => getEl(id), 10))
}