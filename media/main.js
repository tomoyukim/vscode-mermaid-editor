// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // const vscode = acquireVsCodeApi();

  const preview = document.getElementById('preview');
  console.log('activated');
  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    preview.textContent = message.diagram;
    preview.removeAttribute('data-processed');
    mermaid.init();
  });
}());