import * as vscode from 'vscode';
import * as path from 'path';

export default class PreviewPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: PreviewPanel | undefined;

  public static readonly viewType = 'mermaid-editor-preview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private readonly _initDiagram: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string, diagram: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      PreviewPanel.viewType,
      'Mermaid Editor Preview',
      { preserveFocus: false, viewColumn: vscode.ViewColumn.Beside },
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `node_modules` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, 'node_modules')),
          vscode.Uri.file(path.join(extensionPath, 'media'))
        ]
      }
    );

    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionPath, diagram);
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionPath: string,
    diagram: string
  ) {
    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionPath, diagram);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionPath: string,
    diagram: string
  ) {
    this._panel = panel;
    this._extensionPath = extensionPath;
    this._initDiagram = diagram;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public renderDiagram(diagram: String) {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ diagram });
  }

  public dispose() {
    PreviewPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview(this._initDiagram);
  }

  private _getHtmlForWebview(diagram: string) {
    const scriptUri = vscode.Uri.file(
      path.join(this._extensionPath, 'media', 'main.js')
    ).with({
      scheme: 'vscode-resource'
    });

    const mermaidUri = vscode.Uri.file(
      path.join(
        this._extensionPath,
        'node_modules',
        'mermaid/dist/mermaid.min.js'
      )
    ).with({
      scheme: 'vscode-resource'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mermaid Editor Preview</title>
    </head>
    <body>
      <div id="preview" class="mermaid">
      ${diagram}
      </div>
      <script src="${mermaidUri}"></script>
      <script>mermaid.initialize({startOnLoad:true,theme:"dark"});</script>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
