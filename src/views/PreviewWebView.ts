import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../constants';
import get from 'lodash/get';
import Logger from '../Logger';
import VSCodeWrapper from '../VSCodeWrapper';

export interface PreviewWebViewRenderParams {
  code: string;
  mermaidConfig: string;
  backgroundColor: string;
}

export default class PreviewWebView {
  private readonly _showOptions = {
    preserveFocus: false,
    viewColumn: vscode.ViewColumn.Beside
  };

  private _vscodeWrapper: VSCodeWrapper;
  private _extensionPath: string;
  private _panel: vscode.WebviewPanel | undefined;
  private _logger: Logger;

  constructor(context: vscode.ExtensionContext, panel?: vscode.WebviewPanel) {
    this._vscodeWrapper = new VSCodeWrapper();
    this._extensionPath = context.extensionPath;
    this._panel = panel ? panel : this._createWebViewPanel();
    this._logger = new Logger();

    this._panel.webview.onDidReceiveMessage(message =>
      this.onDidReceiveMessage(message)
    );
  }

  private _createWebViewPanel(): vscode.WebviewPanel {
    return this._vscodeWrapper.createWebviewPanel(
      constants.PREVIEW_WEBVIEW_VIEWTYPE,
      'Mermaid Editor Preview',
      this._showOptions,
      {
        enableScripts: true,
        localResourceRoots: [
          this._vscodeWrapper.file(
            path.join(this._extensionPath, 'node_modules')
          ),
          this._vscodeWrapper.file(path.join(this._extensionPath, 'media'))
        ]
      }
    );
  }

  private _mergeConfig(mermaidConfig: string): string {
    let configObject = {};
    try {
      configObject = JSON.parse(mermaidConfig);
    } catch (error) {
      this._logger.outputError(error.message);
    }

    const config = {
      ...configObject,
      startOnLoad: true
    };
    return JSON.stringify(config);
  }

  private _getHtml(
    code: string,
    backgroundColor: string,
    mermaidConfig: string,
    scriptUri: vscode.Uri,
    mermaidUri: vscode.Uri
  ): string {
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
      <script>mermaid.initialize(${mermaidConfig});</script>
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  public get active(): boolean {
    return get(this._panel, 'active', false);
  }

  public get visible(): boolean {
    return get(this._panel, 'visible', false);
  }

  public dispose(): void {
    this._panel?.dispose();
    this._panel = undefined;
  }

  public zoomTo(value: number): void {
    this._panel?.webview.postMessage({
      command: 'zoomTo',
      value
    });
  }

  public render(param: PreviewWebViewRenderParams): void {
    if (!this._panel) {
      return;
    }
    const scriptUri = this._panel.webview.asWebviewUri(
      this._vscodeWrapper.file(
        path.join(this._extensionPath, 'media', 'main.js')
      )
    );
    const mermaidUri = this._panel.webview.asWebviewUri(
      this._vscodeWrapper.file(
        path.join(
          this._extensionPath,
          'node_modules',
          'mermaid/dist/mermaid.min.js'
        )
      )
    );
    const mergedConfig = this._mergeConfig(param.mermaidConfig);

    this._panel.webview.html = this._getHtml(
      param.code,
      param.backgroundColor,
      mergedConfig,
      scriptUri,
      mermaidUri
    );
  }

  public updateView(param: PreviewWebViewRenderParams): void {
    this._panel?.webview.postMessage({
      command: 'update',
      diagram: param.code,
      configuration: param.mermaidConfig,
      backgroundColor: param.backgroundColor
    });
  }

  public reviel(): void {
    this._panel?.reveal(
      this._showOptions.viewColumn,
      this._showOptions.preserveFocus
    );
  }

  public get onDidChangeViewState():
    | vscode.Event<vscode.WebviewPanelOnDidChangeViewStateEvent>
    | undefined {
    return this._panel?.onDidChangeViewState;
  }

  public get onDidDispose(): vscode.Event<void> | undefined {
    return this._panel?.onDidDispose;
  }

  // TODO: public captureImage() { }

  // TODO: public onDidCaptureImage() { }

  // TODO: public onDidParseError() {}

  // callbacks
  public async onDidReceiveMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'onTakeImage':
        //this._onTakeImage && this._onTakeImage(message.data, message.type);
        return;
      case 'onFailTakeImage':
        //this._onFailTakeImage && this._onFailTakeImage(message.error);
        return;
      case 'onParseError':
        this._logger.outputError(message.error.str);
        return;
    }
  }
}
