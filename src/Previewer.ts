import * as vscode from 'vscode';
import * as path from 'path';
import isEmpty = require('lodash/isEmpty');
import isNumber = require('lodash/isNumber');
import get = require('lodash/get');
import { isMermaid } from './util';
import Logger from './Logger';
import AttributeParser from './AttributeParser';
import { TextDecoder } from 'util';

const getDiagram = (): string => {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !isMermaid(editor.document)) {
    return '';
  }

  return editor.document.getText().trim();
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
  private _timer: NodeJS.Timeout | null;

  public static createOrShow(extensionPath: string): void {
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
  ): void {
    Previewer.currentPanel = new Previewer(panel, state, extensionPath);
  }

  private static getConfiguration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('mermaid-editor.preview');
  }

  private static setContext(contextName: string, value: boolean): void {
    vscode.commands.executeCommand('setContext', contextName, value);
  }

  private static outputError(message: string): void {
    Logger.instance().appendLine(message);
    Logger.instance().appendDivider();
    Logger.instance().show();
  }

  private constructor(
    panel: vscode.WebviewPanel,
    state: any,
    extensionPath: string
  ) {
    this._panel = panel;
    this._extensionPath = extensionPath;
    this._scale = state.scale || 1.0;
    this._timer = null;

    // Set the webview's initial html content
    this._loadContent(state.diagram, state.configuration);

    Previewer.setContext('mermaidPreviewEnabled', true);
    Previewer.setContext('mermaidPreviewActive', this._panel.active);
    Previewer.setContext('mermaidPreviewVisible', this._panel.visible);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      () => {
        Previewer.setContext('mermaidPreviewActive', this._panel.active);
        Previewer.setContext('mermaidPreviewVisible', this._panel.visible);
        if (this._panel.visible) {
          this._loadContent(undefined, undefined);
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
          case 'onParseError':
            Previewer.outputError(message.error.str);
            return;
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeTextDocument(
      editor => {
        if (editor && isMermaid(editor.document)) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeConfiguration(
      () => {
        this._loadContent(undefined, undefined);
      },
      null,
      this._disposables
    );

    vscode.window.onDidChangeActiveTextEditor(
      editor => {
        if (editor && isMermaid(editor.document)) {
          this._updateDiagram();
        }
      },
      null,
      this._disposables
    );
  }

  public dispose(): void {
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

  public takeImage(config: vscode.WorkspaceConfiguration): void {
    this._panel.webview.postMessage({
      ...config,
      command: 'takeImage'
    });
  }

  public onTakeImage(callback: (data: string, type: string) => void): void {
    this._onTakeImage = callback;
  }

  public zoomIn(): void {
    this.zoomTo(this._scale + ZOOM_SCALE_INTERVAL);
  }

  public zoomOut(): void {
    this.zoomTo(this._scale - ZOOM_SCALE_INTERVAL);
  }

  public zoomReset(): void {
    this.zoomTo(1.0);
  }

  public zoomTo(value: number): void {
    if (!this._panel.visible || !isNumber(value) || Number.isNaN(value)) {
      return;
    }

    const prev = this._scale;
    this._scale = value;
    if (!this._scaleInRange()) {
      this._scale = prev;
      return;
    }

    this._panel.webview.postMessage({
      command: 'zoomTo',
      value: this._scale
    });
  }

  private _getBackgroundColor(text: string): string {
    const ret = AttributeParser.parseBackgroundColor(text);
    return ret ? ret : Previewer.getConfiguration().backgroundColor;
  }

  private async _getMermaidConfig(text: string): Promise<string> {
    const _readFile = async (uri: vscode.Uri): Promise<string> => {
      const config = await vscode.workspace.fs.readFile(uri);
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(config);
    };

    try {
      const pathToConfig = AttributeParser.parseConfig(text);
      if (!isEmpty(pathToConfig)) {
        const editor = vscode.window.activeTextEditor;
        const uri = vscode.Uri.file(
          path.join(
            editor
              ? path.dirname(editor.document.fileName)
              : this._extensionPath,
            pathToConfig
          )
        );
        return await _readFile(uri);
      }

      const pathToDefaultConfig = Previewer.getConfiguration()
        .defaultMermaidConfig;
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (pathToDefaultConfig && workspaceFolders) {
        const uri = vscode.Uri.file(
          path.join(workspaceFolders[0].uri.fsPath, pathToDefaultConfig)
        );
        return await _readFile(uri);
      } else {
        return JSON.stringify({
          theme: 'default'
        });
      }
    } catch (error) {
      Previewer.outputError(error.message);
      return '{}';
    }
  }

  private _scaleInRange(): boolean {
    if (this._scale < ZOOM_MIN_SCALE || ZOOM_MAX_SCALE < this._scale) {
      return false;
    }
    return true;
  }

  private _updateDiagram(): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      const diagram = getDiagram();
      this._getMermaidConfig(diagram).then((configuration: string) => {
        this._panel.webview.postMessage({
          command: 'update',
          diagram,
          configuration
        });
      });
      this._timer = null;
    }, 200);
  }

  private _loadContent(
    text: string | undefined,
    configText: string | undefined
  ): void {
    const diagram = text
      ? text
      : isMermaid(get(vscode.window.activeTextEditor, 'document'))
      ? getDiagram()
      : '';

    const setHtml = (configuration: string): void => {
      this._panel.webview.html = this._getHtmlForWebview(
        diagram,
        configuration
      );
    };
    if (configText) {
      setHtml(configText);
    } else {
      this._getMermaidConfig(diagram).then(setHtml);
    }
  }

  private _getHtmlForWebview(diagram: string, configuration: string): string {
    const scriptUri = this._panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionPath, 'media', 'main.js'))
    );

    const mermaidUri = this._panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          this._extensionPath,
          'node_modules',
          'mermaid/dist/mermaid.min.js'
        )
      )
    );

    let configObject = {};
    try {
      configObject = JSON.parse(configuration);
    } catch (error) {
      Previewer.outputError(error.message);
    }

    const backgroundColor = this._getBackgroundColor(diagram);
    const config = {
      ...configObject,
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
