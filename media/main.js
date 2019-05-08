// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();
  const preview = document.getElementById('preview');

  const prevState = vscode.getState();
  if (preview.textContent.trim() === '') {
    preview.textContent = prevState ? prevState.diagram : preview.textContent;
  } else {
    vscode.setState({ diagram: preview.textContent });
  }

  console.log('activated');
  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case 'update':
        preview.textContent = message.diagram;
        preview.removeAttribute('data-processed');
        mermaid.init();
        vscode.setState({ diagram });
        break;
      case 'takeImage':
        vscode.postMessage({ command: 'onTakeImage', payload: preview.innerHTML });
        break;
      default:
        break;
    }
  });
}());