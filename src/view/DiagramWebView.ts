import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../constants';
import get from 'lodash/get';
import FileSystemService from '../models/FileSystemService';
import {
  CaptureImageEndEvent,
  CaptureImageParams,
  DiagramWebViewRenderParams,
  ErrorEvent,
  WebViewEvent
} from './DiagramWebViewTypes';
import Renderer, { RendererError } from './Renderer';
import { ViewState, ViewStateAction } from '../controllers/viewStateStore';

type ShowOptions = {
  preserveFocus: boolean;
  viewColumn: vscode.ViewColumn;
};

export default class DiagramWebView extends Renderer<
  DiagramWebViewRenderParams,
  ViewState,
  ViewStateAction
> {
  private _fileSystemService: FileSystemService;
  private _extensionPath: string;
  private _showOptions: ShowOptions;
  private _panel: vscode.WebviewPanel | undefined;

  private _captureEventEmitter: vscode.EventEmitter<CaptureImageEndEvent>;
  private _errorEventEmitter: vscode.EventEmitter<ErrorEvent>;
  private _viewStateActivityEventEmitter: vscode.EventEmitter<boolean>;
  private _viewStateVisibilityEventEmitter: vscode.EventEmitter<boolean>;
  private _viewRenderRequestEventEmitter: vscode.EventEmitter<void>;

  private _state: {
    active: boolean;
    visible: boolean;
    scale: number;
  };

  constructor(
    extensionPath: string,
    showOptions: ShowOptions,
    fileSystemService: FileSystemService,
    panel: vscode.WebviewPanel
  ) {
    super();

    this._fileSystemService = fileSystemService;
    this._extensionPath = extensionPath;
    this._showOptions = showOptions;
    this._panel = panel;

    this._captureEventEmitter = new vscode.EventEmitter<CaptureImageEndEvent>();
    this._errorEventEmitter = new vscode.EventEmitter<ErrorEvent>();
    this._viewStateActivityEventEmitter = new vscode.EventEmitter<boolean>();
    this._viewStateVisibilityEventEmitter = new vscode.EventEmitter<boolean>();
    this._viewRenderRequestEventEmitter = new vscode.EventEmitter<void>();

    this._panel.webview.onDidReceiveMessage(e => this.onDidReceiveMessage(e));
    this._panel.onDidChangeViewState(e => this.onDidChangeViewState(e));

    // inital state
    this._state = {
      active: this.active,
      visible: this.visible,
      scale: constants.ZOOM_DEFAULT_SCALE
    };
  }

  private _putStartOnLoadConfig(mermaidConfig: string): string {
    let configObject = {};
    try {
      configObject = JSON.parse(mermaidConfig);
    } catch (error) {
      this._errorEventEmitter.fire({
        kind: 'error/mermaid-config-json-parse',
        message: error.message
      });
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/css/fontawesome.min.css">
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

  // only for test
  public get panel(): vscode.WebviewPanel | undefined {
    return this._panel;
  }

  // only for test
  public get extensionPath(): string {
    return this._extensionPath;
  }

  public get showOptions(): ShowOptions {
    return this._showOptions;
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

  public zoomIn(): void {
    this.zoomTo(this._state.scale + constants.ZOOM_SCALE_INTERVAL);
  }

  public zoomOut(): void {
    this.zoomTo(this._state.scale - constants.ZOOM_SCALE_INTERVAL);
  }

  public zoomReset(): void {
    this.zoomTo(constants.ZOOM_DEFAULT_SCALE);
  }

  public zoomTo(value: number): void {
    let newScale = value;
    if (newScale > constants.ZOOM_MAX_SCALE) {
      newScale = constants.ZOOM_MAX_SCALE;
    }
    if (newScale < constants.ZOOM_MIN_SCALE) {
      newScale = constants.ZOOM_MIN_SCALE;
    }
    this._state.scale = newScale;
    this._panel?.webview.postMessage({
      command: 'zoomTo',
      value: newScale
    });
  }

  // override
  public notifyError(error: RendererError): void {
    this._errorEventEmitter.fire(error);
  }

  // overrid  e
  public render(param: DiagramWebViewRenderParams): void {
    if (!this._panel) {
      return;
    }
    const scriptUri = this._panel.webview.asWebviewUri(
      this._fileSystemService.file(
        path.join(this._extensionPath, 'media', 'main.js')
      )
    );
    const mermaidUri = this._panel.webview.asWebviewUri(
      this._fileSystemService.file(
        path.join(
          this._extensionPath,
          'dist/vendor',
          'mermaid/dist/mermaid.min.js'
        )
      )
    );
    const mergedConfig = this._putStartOnLoadConfig(param.mermaidConfig);
    this._viewRenderRequestEventEmitter.fire();

    this._panel.webview.html = this._getHtml(
      param.code,
      param.backgroundColor,
      mergedConfig,
      scriptUri,
      mermaidUri
    );
  }

  // override
  public updateView(param: DiagramWebViewRenderParams): void {
    this._viewRenderRequestEventEmitter.fire();
    this._panel?.webview.postMessage({
      command: 'update',
      code: param.code,
      configuration: param.mermaidConfig,
      backgroundColor: param.backgroundColor
    });
  }

  public reviel(): void {
    this._viewRenderRequestEventEmitter.fire();
    this._panel?.reveal(
      this._showOptions.viewColumn,
      this._showOptions.preserveFocus
    );
  }

  public captureImage(params: CaptureImageParams): void {
    this._panel?.webview.postMessage({
      ...params,
      command: 'takeImage'
    });
  }

  public get onDidChangeViewStateActivity(): vscode.Event<boolean> {
    return this._viewStateActivityEventEmitter.event;
  }

  public get onDidChangeViewStateVisibility(): vscode.Event<boolean> {
    return this._viewStateVisibilityEventEmitter.event;
  }

  public get onDidDispose(): vscode.Event<void> | undefined {
    return this._panel?.onDidDispose;
  }

  public get onDidCaptureImage(): vscode.Event<CaptureImageEndEvent> {
    return this._captureEventEmitter.event;
  }

  public get onDidError(): vscode.Event<ErrorEvent> {
    return this._errorEventEmitter.event;
  }

  public get onDidViewRenderRequested(): vscode.Event<void> {
    return this._viewRenderRequestEventEmitter.event;
  }

  // callbacks
  public async onDidReceiveMessage(message: WebViewEvent): Promise<void> {
    switch (message.command) {
      case 'onTakeImage':
        this._captureEventEmitter.fire({
          kind: 'capture_image/success',
          data: message.data,
          type: message.type
        });
        return;
      case 'onFailTakeImage':
        this._captureEventEmitter.fire({
          kind: 'capture_image/failure',
          error: message.error
        });
        return;
      case 'onParseError':
        this._errorEventEmitter.fire({
          kind: 'error/diagram-parse',
          message: message.error.str
        });
        return;
    }
  }

  public onDidChangeViewState(
    e: vscode.WebviewPanelOnDidChangeViewStateEvent
  ): void {
    const active = e.webviewPanel.active;
    const visible = e.webviewPanel.visible;

    if (this._state.active !== active) {
      this._viewStateActivityEventEmitter.fire(active);
    }
    if (this._state.visible !== visible) {
      this._viewStateVisibilityEventEmitter.fire(visible);
    }
    this._state = {
      active,
      visible,
      scale: this._state.scale
    };
  }
}
