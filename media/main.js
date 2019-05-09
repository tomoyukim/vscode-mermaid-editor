// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function() {
  const vscode = acquireVsCodeApi();
  const preview = document.getElementById('preview');

  const prevState = vscode.getState();
  if (preview.textContent.trim() === '') {
    preview.textContent = prevState ? prevState.diagram : preview.textContent;
  } else {
    vscode.setState({ diagram: preview.textContent });
  }

  function convertToPng(svgBase64, width, height, backgroundColor, callback) {
    const elem = document.createElement('canvas');
    elem.setAttribute('width', width);
    elem.setAttribute('height', height);
    elem.setAttribute('style', 'display: none;');
    elem.setAttribute('id', 'cnvs');
    preview.parentNode.appendChild(elem);

    const canvas = document.getElementById('cnvs');
    const ctx = canvas.getContext('2d');

    const imgSrc = `data:image/svg+xml;charset=utf-8;base64,${svgBase64}`;
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0);

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      callback(canvas.toDataURL().replace(/^data:image\/png;base64,/, ''));
      canvas.parentNode.removeChild(canvas);
    };
    img.src = imgSrc;
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case 'update':
        const { diagram } = message;
        preview.textContent = diagram;
        preview.removeAttribute('data-processed');
        mermaid.init();
        vscode.setState({ diagram });
        return;
      case 'takeImage':
        const { type, width, height, backgroundColor } = message;
        const data = btoa(unescape(encodeURIComponent(preview.innerHTML))); // svg base64

        if (type !== 'png') {
          vscode.postMessage({ command: 'onTakeImage', data, type });
          return;
        }

        convertToPng(data, width, height, backgroundColor, pngBase64 => {
          vscode.postMessage({
            command: 'onTakeImage',
            data: pngBase64,
            type
          });
        });
        return;
    }
  });
})();
