import * as vscode from 'vscode';
import * as path from 'path';
import isNumber = require('lodash/isNumber');
import { isMermaid } from './util';

const getDiagram = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !isMermaid(editor)) return '';

  return editor.document.getText();
};

const ZOOM_MIN_SCALE = 0.1;
const ZOOM_MAX_SCALE = 2.5;
const ZOOM_SCALE_INTERVAL = 0.2;

export default class Previewer {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: Previewer | undefined;

  public static readonly viewType = 'mermaid-editor-preview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _scale: number;
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

  private static getConfiguration() {
    return vscode.workspace.getConfiguration('mermaid-editor.preview');
  }

  private static setContext(contextName: string, value: boolean) {
    vscode.commands.executeCommand('setContext', contextName, value);
  }

  private scaleInRange() {
    if (this._scale < ZOOM_MIN_SCALE || ZOOM_MAX_SCALE < this._scale) {
      return false;
    }
    return true;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    state: any,
    extensionPath: string
  ) {
    this._panel = panel;
    this._extensionPath = extensionPath;
    this._scale = state.scale || 1.0;

    // Set the webview's initial html content
    this._loadContent(state.diagram);

    Previewer.setContext('mermaidPreviewEnabled', true);
    Previewer.setContext('mermaidPreviewActive', this._panel.active);
    Previewer.setContext('mermaidPreviewVisible', this._panel.visible);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        Previewer.setContext('mermaidPreviewActive', this._panel.active);
        Previewer.setContext('mermaidPreviewVisible', this._panel.visible);
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
      backgroundColor: Previewer.getConfiguration().backgroundColor,
      command: 'takeImage'
    });
  }

  public onTakeImage(callback: (data: string, type: string) => void) {
    this._onTakeImage = callback;
  }

  public zoomIn() {
    this.zoomTo(this._scale + ZOOM_SCALE_INTERVAL);
  }

  public zoomOut() {
    this.zoomTo(this._scale - ZOOM_SCALE_INTERVAL);
  }

  public zoomReset() {
    this.zoomTo(1.0);
  }

  public zoomTo(value: number) {
    if (!this._panel.visible || !isNumber(value) || Number.isNaN(value)) {
      return;
    }

    const prev = this._scale;
    this._scale = value;
    if (!this.scaleInRange()) {
      this._scale = prev;
      return;
    }

    this._panel.webview.postMessage({
      command: 'zoomTo',
      value: this._scale
    });
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

    const { theme, backgroundColor } = Previewer.getConfiguration();
    const config = {
      theme,
      startOnLoad: true
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mermaid Editor Preview</title>
      <link rel="stylesheet" href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css">
      <style>
      body {
        background-color: ${backgroundColor};
      }
      </style>
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
