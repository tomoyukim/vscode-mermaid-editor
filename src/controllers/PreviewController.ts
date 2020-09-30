import * as vscode from 'vscode';
import VSCodeWrapper from '../VSCodeWrapper';
import get from 'lodash/get';
import * as constants from '../constants';
import PreviewWebView, {
  CaptureImageEndEvent,
  PreviewWebViewRenderParams
} from '../views/PreviewWebView';
import CodeEditorView, { CodeChangeEvent } from '../views/CodeEditorView';
import MermaidConfig from '../models/MermaidConfig';
import PreviewConfig, {
  PreviewConfigChangeEvent,
  PreviewConfigProperty
} from '../models/PreviewConfig';
import Logger from '../Logger';
import * as generator from './fileGenerator';

interface WebViewState {
  scale: number;
  code: string;
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
  private _statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._vscodeWrapper = new VSCodeWrapper();

    this._codeEditorView = new CodeEditorView();
    this._mermaidConfig = new MermaidConfig();
    this._previewConfig = new PreviewConfig(this._codeEditorView.code);
    this._timer = null;
    this._logger = new Logger();

    // generating message on statusbar
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this._statusBarItem.text = constants.STATUSBAR_MESSAGE_GENERATE_IMAGE;
    context.subscriptions.push(this._statusBarItem);

    // once
    this._mermaidConfig
      .init(this._codeEditorView.document, this._codeEditorView.code)
      .catch(error => {
        this._logger.outputError(error.message);
      });

    // register callbacks
    this._codeEditorView.onDidChangeCode((event: CodeChangeEvent) => {
      this.onDidChangeCode(event);
    });

    this._mermaidConfig.onDidChangeMermaidConfig(() => {
      this.onDidChangeMermaidConfig();
    });

    this._previewConfig.onDidChangePreviewConfig(
      (event: PreviewConfigChangeEvent) => {
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
    this._registerCommand(context, constants.COMMAND_GENERATE_IMAGE, () =>
      this.captureImage()
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

    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_ENABLED,
      true
    );
    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_ACTIVE,
      view.active
    );
    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_VISIBLE,
      view.visible
    );

    view.onDidChangeViewState &&
      view.onDidChangeViewState(() => this.onDidChangeViewState());
    view.onDidDispose && view.onDidDispose(() => this.onDidDispose());
    view.onDidCaptureImage(event => this.onDidCaptureImage(event));

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
    this._statusBarItem.dispose();
    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_ENABLED,
      false
    );

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

  public async captureImage(): Promise<void> {
    const config = this._vscodeWrapper.getConfiguration(
      constants.CONFIG_SECTION_ME_GENERATE
    );

    this._previewWebView?.captureImage({
      type: config.type,
      width: config.width,
      height: config.height
    });
    this._statusBarItem.show();
  }

  // model change events
  public async onDidChangeCode(event: CodeChangeEvent): Promise<void> {
    this._mermaidConfig.updateConfig(event.document, event.code);
    this._previewConfig.updateBackgroundColor(event.code);
    this._debounceUpdateView();
  }

  public async onDidChangeMermaidConfig(): Promise<void> {
    this._debounceUpdateView();
  }

  public async onDidChangePreviewConfig(
    event: PreviewConfigChangeEvent
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

  // WebviewPanel event
  public async onDidChangeViewState(): Promise<void> {
    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_ACTIVE,
      get(this._previewWebView, 'active', false)
    );
    this._vscodeWrapper.setContext(
      constants.CONTEXT_SECTION_PREVIEW_VISIBLE,
      get(this._previewWebView, 'visible', false)
    );
    return;
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
    this.dispose();
  }

  public async onDidCaptureImage(event: CaptureImageEndEvent): Promise<void> {
    if (event.error || !event.data || !event.type) {
      vscode.window.showErrorMessage(constants.MESSAGE_GENERATE_IMAGE_FAILURE);
    } else {
      try {
        await generator.outputFile(this._context, event.data, event.type);
        vscode.window.showInformationMessage(
          constants.MESSAGE_GENERATE_IMAGE_SUCCESS
        );
      } catch (error) {
        this._logger.appendLine(error.message);
        vscode.window.showErrorMessage(error.message);
      }
      this._logger.show();
    }

    this._statusBarItem.hide();
  }

  // WebviewPanelSelializer
  public async deserializeWebviewPanel(
    webviewPanel: vscode.WebviewPanel,
    state: WebViewState | undefined
  ): Promise<void> {
    // TODO: handling state more (e.g. backgroundColor, position, config)
    const code = state ? state.code : '';
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
