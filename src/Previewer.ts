import * as vscode from 'vscode';
import * as path from 'path';
import get = require('lodash/get');
import { isMermaid } from './util';

const getDiagram = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !isMermaid(editor)) return '';

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
  private _disposables: vscode.Disposable[] = [];
  private _onTakeImage: ((data: string, type: string) => void) | undefined;

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

    Previewer.currentPanel = new Previewer(panel, {}, extensionPath);
  }

  public static revive(
    panel: vscode.WebviewPanel,
    state: any,
    extensionPath: string
  ) {
    Previewer.currentPanel = new Previewer(panel, state, extensionPath);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    state: any,
    extensionPath: string
  ) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this._loadContent(state.diagram);

    vscode.commands.executeCommand('setContext', 'mermaidPreviewEnabled', true);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._loadContent(undefined);
        }
      },
      null,
      this._disposables
    );

    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'onTakeImage':
            this._onTakeImage && this._onTakeImage(message.data, message.type);
            return;
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeTextDocument(
      editor => {
        if (editor && isMermaid(editor)) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeConfiguration(
      e => {
        this._loadContent(undefined);
      },
      null,
      this._disposables
    );

    vscode.window.onDidChangeActiveTextEditor(
      editor => {
        if (editor && isMermaid(editor)) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    vscode.commands.executeCommand(
      'setContext',
      'mermaidPreviewEnabled',
      false
    );
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

  public takeImage(config: any) {
    this._panel.webview.postMessage({
      ...config,
      command: 'takeImage'
    });
  }

  public onTakeImage(callback: (data: string, type: string) => void) {
    this._onTakeImage = callback;
  }

  private _updateDiagram() {
    this._panel.webview.postMessage({
      command: 'update',
      diagram: getDiagram()
    });
  }

  private _loadContent(diagram: string | undefined) {
    this._panel.webview.html = this._getHtmlForWebview(
      diagram
        ? diagram
        : isMermaid(vscode.window.activeTextEditor)
        ? getDiagram()
        : ''
    );
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
