import getEl from "./getEl";
const overlay = await getEl('canvas-overlay')
export default function prompt(content) {
	requestAnimationFrame(() => {
		if (content !== null) {
			overlay.innerHTML += content;
			overlay.classList.add('active');
		} else {
			overlay.innerHTML;
			overlay.classList.remove('active');
		}
	});
}