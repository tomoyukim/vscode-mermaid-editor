import * as vscode from 'vscode';
import VSCodeWrapper from '../VSCodeWrapper';
import get from 'lodash/get';
import * as constants from '../constants';
import PreviewWebView, {
  PreviewWebViewRenderParams
} from '../views/PreviewWebView';
import CodeEditorView, { CodeChange } from '../views/CodeEditorView';
import MermaidConfig from '../models/MermaidConfig';
import PreviewConfig, {
  PreviewConfigChange,
  PreviewConfigProperty
} from '../models/PreviewConfig';
import Logger from '../Logger';

interface WebViewState {
  scale: number;
  diagram: string;
  scrollTop: number;
  scrollLeft: number;
}

export default class PreviewController
  implements vscode.WebviewPanelSerializer {
  private _context: vscode.ExtensionContext;
  private _vscodeWrapper: VSCodeWrapper;

  private _previewWebView: PreviewWebView | undefined;
  private _codeEditorView: CodeEditorView;

  private _mermaidConfig: MermaidConfig;
  private _previewConfig: PreviewConfig;
  private _timer: NodeJS.Timeout | null;
  private _logger: Logger;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._vscodeWrapper = new VSCodeWrapper();

    this._codeEditorView = new CodeEditorView();
    this._mermaidConfig = new MermaidConfig();
    this._previewConfig = new PreviewConfig(this._codeEditorView.code);
    this._timer = null;
    this._logger = new Logger();

    // once
    this._mermaidConfig
      .init(this._codeEditorView.document, this._codeEditorView.code)
      .catch(error => {
        this._logger.outputError(error.message);
      });

    // register callbacks
    this._codeEditorView.onDidChangeCode((event: CodeChange) => {
      this.onDidChangeCode(event);
    });

    this._mermaidConfig.onDidChangeMermaidConfig(() => {
      this.onDidChangeMermaidConfig();
    });

    this._previewConfig.onDidChangePreviewConfig(
      (event: PreviewConfigChange) => {
        this.onDidChangePreviewConfig(event);
      }
    );

    // register commands
    this._registerCommand(context, constants.COMMAND_PREVIEW_SHOW, () =>
      this.showPreviewWebView({
        code: this._codeEditorView.code,
        mermaidConfig: this._mermaidConfig.config,
        backgroundColor: this._previewConfig.backgroundColor
      })
    );
    this._registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_IN, () =>
      this.zoomIn()
    );
    this._registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_OUT, () =>
      this.zoomOut()
    );
    this._registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_RESET, () =>
      this.zoomReset()
    );
    this._registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_TO, () =>
      this.zoomTo()
    );

    this._vscodeWrapper.registerWebviewPanelSerializer(
      constants.PREVIEW_WEBVIEW_VIEWTYPE,
      this
    );
  }

  private _createPreviewWebView(
    context: vscode.ExtensionContext,
    panel?: vscode.WebviewPanel
  ): PreviewWebView {
    const view = new PreviewWebView(context, panel);

    this._vscodeWrapper.setContext('mermaidPreviewEnabled', true);
    this._vscodeWrapper.setContext('mermaidPreviewActive', view.active);
    this._vscodeWrapper.setContext('mermaidPreviewVisible', view.visible);

    view.onDidChangeViewState &&
      view.onDidChangeViewState(() => this.onDidChangeViewState());
    view.onDidDispose && view.onDidDispose(() => this.onDidDispose());

    return view;
  }

  private _registerCommand(
    context: vscode.ExtensionContext,
    command: string,
    callback: () => void
  ): void {
    context.subscriptions.push(
      this._vscodeWrapper.registerCommand(command, callback)
    );
  }

  private _debounceUpdateView(): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this._previewWebView?.updateView({
        code: this._codeEditorView.code,
        mermaidConfig: this._mermaidConfig.config,
        backgroundColor: this._previewConfig.backgroundColor
      });
      this._timer = null;
    }, 200);
  }

  public async showPreviewWebView(
    params: PreviewWebViewRenderParams,
    panel?: vscode.WebviewPanel
  ): Promise<void> {
    if (!this._previewWebView) {
      this._previewWebView = this._createPreviewWebView(this._context, panel);
    }
    this._previewWebView?.render(params);
    this._previewWebView?.reviel();
  }

  public dispose(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._vscodeWrapper.setContext('mermaidPreviewEnabled', false);

    this._previewWebView?.dispose();
  }

  // commands
  public async zoomIn(): Promise<void> {
    const value = this._previewConfig.scale + constants.ZOOM_SCALE_INTERVAL;
    this._previewConfig.scale = value;
  }

  public async zoomOut(): Promise<void> {
    const value = this._previewConfig.scale - constants.ZOOM_SCALE_INTERVAL;
    this._previewConfig.scale = value;
  }

  public async zoomReset(): Promise<void> {
    this._previewConfig.scale = constants.ZOOM_DEFAULT_SCALE;
  }

  public async zoomTo(): Promise<void> {
    const value = await this._vscodeWrapper.showInputBox({
      placeHolder: 'scale'
    });
    if (value) {
      this._previewConfig.scale = parseFloat(value);
    }
  }

  // model change events
  public async onDidChangeCode(event: CodeChange): Promise<void> {
    this._mermaidConfig.updateConfig(event.document, event.code);
    this._previewConfig.updateBackgroundColor(event.code);
    this._debounceUpdateView();
  }

  public async onDidChangeMermaidConfig(): Promise<void> {
    this._debounceUpdateView();
  }

  public async onDidChangePreviewConfig(
    event: PreviewConfigChange
  ): Promise<void> {
    switch (event.property) {
      case PreviewConfigProperty.BackgroundColor:
        this._debounceUpdateView();
        break;
      case PreviewConfigProperty.Scale:
        this._previewWebView?.zoomTo(this._previewConfig.scale);
        break;
      default:
        break;
    }
  }

  public async onDidChangeViewState(): Promise<void> {
    this._vscodeWrapper.setContext(
      'mermaidPreviewActive',
      get(this._previewWebView, 'active', false)
    );
    this._vscodeWrapper.setContext(
      'mermaidPreviewVisible',
      get(this._previewWebView, 'visible', false)
    );
    if (this._previewWebView?.visible) {
      this._previewWebView?.render({
        code: this._codeEditorView.code,
        mermaidConfig: this._mermaidConfig.config,
        backgroundColor: this._previewConfig.backgroundColor
      });
    }
  }

  public async onDidDispose(): Promise<void> {
    this._previewWebView = undefined;
  }

  // WebviewPanelSelializer
  public async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: WebViewState | undefined
  ): Promise<void> {
    // TODO: handling state more (e.g. backgroundColor, position, config)
    // TODO: rename diagram property in state
    const code = state ? state.diagram : '';
    if (state) {
      this._previewConfig.scale = state.scale;
    }

    this.showPreviewWebView(
      {
        code,
        mermaidConfig: this._mermaidConfig.config,
        backgroundColor: this._previewConfig.backgroundColor
      },
      webviewPanel
    );
  }
}
