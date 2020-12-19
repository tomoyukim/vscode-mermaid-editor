import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../../constants';
import FileSystemService from '../FileSystemService';
import DiagramWebView from './DiagramWebView';
import WebViewPanelProvider from './WebViewPanelProvider';

interface WebViewState {
  scale: number;
  code: string;
  configuration: string;
  scrollTop: number;
  scrollLeft: number;
}

interface WebViewChangeEvent {
  webView: DiagramWebView | undefined;
}

class WebViewManager implements vscode.WebviewPanelSerializer {
  private readonly _showOptions = {
    preserveFocus: false,
    viewColumn: vscode.ViewColumn.Beside
  };

  private _extensionPath: string;
  private _webViewPanelProvider: WebViewPanelProvider;
  private _fileSystemService: FileSystemService;
  private _eventEmitter: vscode.EventEmitter<WebViewChangeEvent>;

  private _diagramWebView: DiagramWebView | undefined;

  constructor(
    extensionPath: string,
    webViewPanelProvider: WebViewPanelProvider,
    fileSystemService: FileSystemService
  ) {
    this._extensionPath = extensionPath;
    this._webViewPanelProvider = webViewPanelProvider;
    this._fileSystemService = fileSystemService;
    this._eventEmitter = new vscode.EventEmitter<WebViewChangeEvent>();

    this._webViewPanelProvider.registerWebviewPanelSerializer(
      constants.PREVIEW_WEBVIEW_VIEWTYPE,
      this
    );
  }

  private _createWebViewPanel(): vscode.WebviewPanel {
    return this._webViewPanelProvider.createWebviewPanel(
      constants.PREVIEW_WEBVIEW_VIEWTYPE,
      'Mermaid Editor Preview',
      this._showOptions,
      {
        enableScripts: true,
        localResourceRoots: [
          this._fileSystemService.file(
            path.join(this._extensionPath, 'node_modules')
          ),
          this._fileSystemService.file(path.join(this._extensionPath, 'media'))
        ]
      }
    );
  }

  private _createDiagramWebView(
    webViewPanel: vscode.WebviewPanel
  ): DiagramWebView {
    const view = new DiagramWebView(
      this._extensionPath,
      this._showOptions,
      this._fileSystemService,
      webViewPanel
    );
    view.onDidDispose && view.onDidDispose(() => this.onDidDispose());
    return view;
  }

  public get webView(): DiagramWebView {
    if (!this._diagramWebView) {
      const webViewPanel = this._createWebViewPanel();
      this._diagramWebView = this._createDiagramWebView(webViewPanel);
    }

    return this._diagramWebView;
  }

  public get onDidChangeWebView(): vscode.Event<WebViewChangeEvent> {
    return this._eventEmitter.event;
  }

  // callback
  public onDidDispose(): void {
    this._diagramWebView = undefined;
    this._eventEmitter.fire({ webView: undefined });
  }

  // WebviewPanelSelializer
  public async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: WebViewState | undefined
  ): Promise<void> {
    // TODO: restore state and notify another models?
    // scale is slipped in DiagramWebView state and actual restored WebView!!
    this._diagramWebView = this._createDiagramWebView(webviewPanel);
    this._eventEmitter.fire({ webView: this._diagramWebView });
  }
}

export default WebViewManager;
