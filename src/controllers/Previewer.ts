import * as vscode from 'vscode';
import * as path from 'path';
import * as process from 'process';
import isEmpty = require('lodash/isEmpty');
import isNumber = require('lodash/isNumber');
import VSCodeWrapper from '../VSCodeWrapper';
import Logger from '../Logger';
import * as attributeParser from './attributeParser';
import { TextDecoder } from 'util';
import CodeEditorView, { CodeChange } from '../views/CodeEditorView';
import * as constants from '../constants';

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
  private _onFailTakeImage: ((error: Error) => void) | undefined;
  private _timer: NodeJS.Timeout | null;

  private _vscodeWrapper: VSCodeWrapper;
  private _codeEditorView: CodeEditorView;

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

  private getConfiguration(): vscode.WorkspaceConfiguration {
    return this._vscodeWrapper.getConfiguration(
      constants.CONFIG_SECTION_ME_PREVIEW
    );
  }

  private static outputError(message: string): void {
    const logger = new Logger();
    logger.appendLine(message);
    logger.appendDivider();
    logger.show();
  }

  private constructor(
    panel: vscode.WebviewPanel,
    state: any,
    extensionPath: string
  ) {
    this._vscodeWrapper = new VSCodeWrapper();
    this._codeEditorView = new CodeEditorView(state.diagram); // TODO: rename diagram property in state

    this._panel = panel;
    this._extensionPath = extensionPath;
    this._scale = state.scale || 1.0;
    this._timer = null;

    // Set the webview's initial html content
    this._loadContent(state.configuration);

    this._vscodeWrapper.setContext('mermaidPreviewEnabled', true);
    this._vscodeWrapper.setContext('mermaidPreviewActive', this._panel.active);
    this._vscodeWrapper.setContext(
      'mermaidPreviewVisible',
      this._panel.visible
    );

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      () => {
        this._vscodeWrapper.setContext(
          'mermaidPreviewActive',
          this._panel.active
        );
        this._vscodeWrapper.setContext(
          'mermaidPreviewVisible',
          this._panel.visible
        );
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
          case 'onFailTakeImage':
            this._onFailTakeImage && this._onFailTakeImage(message.error);
            return;
          case 'onParseError':
            Previewer.outputError(message.error.str);
            return;
        }
      },
      null,
      this._disposables
    );

    this._codeEditorView.onDidChangeCode((event: CodeChange) => {
      this.onDidChangeCode(event.code);
    });

    vscode.workspace.onDidChangeConfiguration(
      () => {
        this._loadContent(undefined);
      },
      null,
      this._disposables
    );
  }

  public dispose(): void {
    this._vscodeWrapper.setContext('mermaidPreviewEnabled', false);
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

  public onFailTakeImage(callback: (error: Error) => void): void {
    this._onFailTakeImage = callback;
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

  public async onDidChangeCode(code: string): Promise<void> {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this._getMermaidConfig(code).then((configuration: string) => {
        this._panel.webview.postMessage({
          command: 'update',
          diagram: code,
          configuration
        });
      });
      this._timer = null;
    }, 200);
  }

  private _getBackgroundColor(text: string): string {
    const ret = attributeParser.parseBackgroundColor(text);
    return ret ? ret : this.getConfiguration().backgroundColor;
  }

  private async _getMermaidConfig(text: string): Promise<string> {
    const _readFile = async (uri: vscode.Uri): Promise<string> => {
      const config = await vscode.workspace.fs.readFile(uri);
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(config);
    };

    try {
      const pathToConfig = attributeParser.parseConfig(text);
      if (!isEmpty(pathToConfig)) {
        // TODO: fix config isn't applied when preview is focused
        const editor = this._vscodeWrapper.activeTextEditor;
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

      const { defaultMermaidConfig } = this.getConfiguration();
      const workspaceFolders = this._vscodeWrapper.workspaceFolders;
      if (defaultMermaidConfig && workspaceFolders) {
        const _resolvePath = (filePath: string): string => {
          if (filePath[0] === '~') {
            if (process && process.env['HOME']) {
              return path.join(process.env['HOME'], filePath.slice(1));
            } else {
              throw new Error('"~" cannot be resolved in your environment.');
            }
          } else if (path.isAbsolute(filePath)) {
            return filePath;
          }
          return path.join(workspaceFolders[0].uri.fsPath, filePath);
        };
        const pathToDefaultConfig = _resolvePath(defaultMermaidConfig);
        const uri = vscode.Uri.file(pathToDefaultConfig);
        return await _readFile(uri);
      } else {
        const { theme } = this.getConfiguration();
        return JSON.stringify({
          theme
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

  private _loadContent(configText: string | undefined): void {
    const code = this._codeEditorView.code;

    const setHtml = (configuration: string): void => {
      this._panel.webview.html = this._getHtmlForWebview(code, configuration);
    };
    if (configText) {
      setHtml(configText);
    } else {
      this._getMermaidConfig(code).then(setHtml);
    }
  }

  private _getHtmlForWebview(code: string, configuration: string): string {
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

    const backgroundColor = this._getBackgroundColor(code);
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
      ${code}
      </div>
      <script src="${mermaidUri}"></script>
      <script>mermaid.initialize(${JSON.stringify(config)});</script>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
