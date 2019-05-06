import * as vscode from 'vscode';
import * as path from 'path';
import get = require('lodash/get');

const getDiagram = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return '';

  return editor.document.getText();
};

export default class Previewer {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: Previewer | undefined;

  public static readonly viewType = 'mermaid-editor-preview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _diagram: string | undefined;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const showOptions = {
      preserveFocus: false,
      viewColumn: vscode.ViewColumn.Beside
    };

    // If we already have a panel, show it.
    if (Previewer.currentPanel) {
      Previewer.currentPanel._panel.reveal(
        showOptions.viewColumn,
        showOptions.preserveFocus
      );
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      Previewer.viewType,
      'Mermaid Editor Preview',
      showOptions,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, 'node_modules')),
          vscode.Uri.file(path.join(extensionPath, 'media'))
        ]
      }
    );

    Previewer.currentPanel = new Previewer(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    Previewer.currentPanel = new Previewer(panel, extensionPath);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this._loadContent(true);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._loadContent(false);
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeTextDocument(
      e => {
        if (
          e.document === get(vscode, 'window.activeTextEditor', {}).document
        ) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeConfiguration(
      e => {
        // this._updateDiagram();
        this._loadContent(false);
      },
      null,
      this._disposables
    );

    vscode.window.onDidChangeTextEditorSelection(
      e => {
        if (e.textEditor === get(vscode, 'window.activeTextEditor', {})) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    Previewer.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _updateDiagram() {
    this._panel.webview.postMessage({ diagram: getDiagram() });
  }

  private _loadContent(requireLatest: boolean) {
    if (requireLatest || !this._diagram) {
      this._diagram = getDiagram();
    }
    this._panel.webview.html = this._getHtmlForWebview(this._diagram);
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

    const userConfig = vscode.workspace.getConfiguration(
      'mermaid-editor.preview'
    );
    const config = {
      ...userConfig,
      startOnLoad: true
    };

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
      <script>mermaid.initialize(${JSON.stringify(config)});</script>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
