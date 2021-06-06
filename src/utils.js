export default function initBackspaceFilter() {
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Backspace') {
      return;
    }

    const element = e.target;

    const typeFilter = [
      'input',
      'select',
      'textarea',
    ].indexOf(element.nodeName.toLowerCase());
    if (typeFilter >= 0) {
      if (!element.disabled && !element.readonly) {
        return;
      }
    }

    e.preventDefault();
  });
}
