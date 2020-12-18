import { Store } from 'redux';
import * as vscode from 'vscode';
import * as constants from '../constants';
import isEmpty = require('lodash/isEmpty');
import PreviewConfigProvider from '../models/configration/PreviewConfigProvider';
import MermaidDocumentProvider from '../models/editor/MermaidDocumentProvider';
import {
  createChangeMermaidDocumentEvent,
  createChangePreviewConfigBackgroundColorEvent,
  createChangePreviewConfigDefaultMermaidConfigEvent,
  ViewState,
  ViewStateAction
} from './viewStateStore';
import MermaidDocument from '../models/editor/MermaidDocument';
import {
  PreviewConfigChangeEvent,
  PreviewConfigProperty
} from '../models/configration/PreviewConfigProvider';
import WebViewManager from '../models/view/WebViewManager';
import DiagramWebView from '../models/view/DiagramWebView';
import {
  DiagramWebViewRenderParams,
  ErrorEvent
} from '../models/view/DiagramWebViewTypes';
import { GeneratorConfigProperty } from '../models/configration/GeneratorConfigProvider';
import GeneratorConfigProvider from '../models/configration/GeneratorConfigProvider';
import FileGeneratorService from '../models/FileGeneratorService';
import { CaptureImageEndEvent } from '../views/PreviewWebView';
import SystemCommandService from './SystemCommandService';
import MermaidConfigService from '../models/configration/MermaidConfigService';

// for test
export const backgroundSelector = (viewState: ViewState): string => {
  const defaultBackgroundColor = viewState.backgroundColor;
  const individualbackgroundColor =
    viewState.mermaidDocument.code.attribute.backgroundColor;
  return !isEmpty(individualbackgroundColor)
    ? individualbackgroundColor
    : !isEmpty(defaultBackgroundColor)
    ? defaultBackgroundColor
    : 'white';
};

// for test
export const mermaidConfigSelector = (viewState: ViewState): string => {
  const defaultMermaidConfig = viewState.defaultMermaidConfig;
  const individualMermaidConfig =
    viewState.mermaidDocument.code.attribute.pathToConfig;
  return !isEmpty(individualMermaidConfig)
    ? individualMermaidConfig
    : defaultMermaidConfig;
};
/*
export const viewStateSelector = (
  viewState: ViewState
): DiagramWebViewRenderParams => {
  const code = viewState.mermaidDocument.code.value;
  const backgroundColor = backgroundSelector(viewState);
  const mermaidConfig = await this._mermaidConfigService.getMermaidConfig(
    mermaidConfigSelector(viewState)
  );
  return {
    code,
    backgroundColor,
    mermaidConfig: mermaidConfig.value
  };
};
*/

class MainController {
  private _timer: NodeJS.Timeout | null;
  private _viewStateStore: Store<ViewState, ViewStateAction>;
  private _diagramWebView: DiagramWebView | undefined;
  private _webViewManager: WebViewManager;
  private _mermaidDocumentProvider: MermaidDocumentProvider;
  private _previewConfigProvider: PreviewConfigProvider;
  private _generatorConfigProvider: GeneratorConfigProvider;
  private _mermaidConfigService: MermaidConfigService;
  private _fileGeneratorService: FileGeneratorService;
  private _systemCommandService: SystemCommandService;

  constructor(
    viewStateStore: Store<ViewState, ViewStateAction>,
    webViewManager: WebViewManager,
    mermaidDocumentProvider: MermaidDocumentProvider,
    previewConfigProvider: PreviewConfigProvider,
    generatorConfigProvider: GeneratorConfigProvider,
    mermaidConfigService: MermaidConfigService,
    fileGeneratorService: FileGeneratorService,
    systemCommandService: SystemCommandService
  ) {
    this._timer = null;
    this._viewStateStore = viewStateStore;

    this._webViewManager = webViewManager;
    this._mermaidDocumentProvider = mermaidDocumentProvider;
    this._previewConfigProvider = previewConfigProvider;
    this._generatorConfigProvider = generatorConfigProvider;
    this._mermaidConfigService = mermaidConfigService;
    this._fileGeneratorService = fileGeneratorService;
    this._systemCommandService = systemCommandService;

    this._webViewManager.onDidChangeWebView(e =>
      this.onDidChangeWebView(e.webView)
    );

    this._mermaidDocumentProvider.onDidChangeMermaidDocument(e =>
      this.onDidChangeMermaidDocument(e.mermaidDocument)
    );

    this._previewConfigProvider.onDidChangePreviewConfig(e =>
      this.onDidChangePreviewConfig(e)
    );
  }

  private async _setContext(contextSection: string, value: any): Promise<void> {
    await this._systemCommandService.executeCommand(
      'setContext',
      contextSection,
      value
    );
  }

  private async _initWebView(
    webView: DiagramWebView | undefined
  ): Promise<void> {
    this._diagramWebView = webView;

    if (!webView) {
      // disposed
      return;
    }

    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ENABLED, true);
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ACTIVE, webView.active);
    this._setContext(
      constants.CONTEXT_SECTION_PREVIEW_VISIBLE,
      webView.visible
    );

    this._diagramWebView?.onDidChangeViewStateActivity(isActive => {
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_ACTIVE, isActive);
      // TODO: initWebView?
    });
    this._diagramWebView?.onDidChangeViewStateVisibility(isVisible => {
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_VISIBLE, isVisible);
    });
    this._diagramWebView?.onDidCaptureImage(e => this.onDidCaptureImage(e));
    this._diagramWebView?.onDidError((error: ErrorEvent) => {
      // TODO: error output
      switch (error.kind) {
        case 'error/diagram-parse':
        case 'error/mermaid-config-json-parse':
        case 'error/renderer':
        default:
      }
    });

    this._diagramWebView?.bind(
      this._viewStateStore,
      async (viewState: ViewState): Promise<DiagramWebViewRenderParams> => {
        const code = viewState.mermaidDocument.code.value;
        const backgroundColor = backgroundSelector(viewState);
        const mermaidConfig = await this._mermaidConfigService
          .getMermaidConfig(mermaidConfigSelector(viewState))
          .catch(() => ({ value: '{}' }));
        return {
          code,
          backgroundColor,
          mermaidConfig: mermaidConfig.value
        };
      }
    );

    await this._diagramWebView?.init();
    this._diagramWebView?.reviel();
  }

  public async viewStateSelector(
    viewState: ViewState
  ): Promise<DiagramWebViewRenderParams> {
    const code = viewState.mermaidDocument.code.value;
    const backgroundColor = backgroundSelector(viewState);
    const mermaidConfig = await this._mermaidConfigService.getMermaidConfig(
      mermaidConfigSelector(viewState)
    );
    return {
      code,
      backgroundColor,
      mermaidConfig: mermaidConfig.value
    };
  }

  public dispose(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    //TODO: this._statusBarItem.dispose();
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ENABLED, false);
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ACTIVE, false);
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_VISIBLE, false);

    this._diagramWebView?.dispose();
  }

  // commands
  public async showPreview(): Promise<void> {
    if (!this._diagramWebView) {
      await this._initWebView(this._webViewManager.webView);
    }
  }

  public async zoomIn(): Promise<void> {
    this._diagramWebView?.zoomIn();
  }

  public async zoomOut(): Promise<void> {
    this._diagramWebView?.zoomOut();
  }

  public async zoomReset(): Promise<void> {
    this._diagramWebView?.zoomReset();
  }

  public async zoomTo(): Promise<void> {
    /* TODO:
    const value = await this._vscodeWrapper.showInputBox({
      placeHolder: 'scale'
    });
    if (value) {
      this._diagramWebView?.zoomTo(parseFloat(value));
    }
    */
  }

  public async captureImage(): Promise<void> {
    const config = this._generatorConfigProvider.getConfig(
      GeneratorConfigProperty.ImageConfig
    );

    if (config?.kind === 'imageConfig') {
      this._diagramWebView?.captureImage({
        type: config.value.type,
        width: config.value.width,
        height: config.value.height
      });
      // TODO: this._statusBarItem.show();
    }
  }

  // callbacks
  public async onDidCaptureImage(e: CaptureImageEndEvent): Promise<void> {
    if (e.error || !e.data || !e.type) {
      // TODO: error
      vscode.window.showErrorMessage(constants.MESSAGE_GENERATE_IMAGE_FAILURE);
      return;
    } else {
      try {
        await this._fileGeneratorService.outputFile(e.data, '', '', e.type);
        vscode.window.showInformationMessage(
          constants.MESSAGE_GENERATE_IMAGE_SUCCESS
        );
      } catch (error) {
        // TODO: this._logger.appendLine(error.message);
        vscode.window.showErrorMessage(error.message);
      }
      // TODO: this._logger.show();
    }
    // TODO: this._statusBarItem.hide();
  }

  public async onDidChangeWebView(
    webView: DiagramWebView | undefined
  ): Promise<void> {
    await this._initWebView(webView);
  }

  public async onDidChangeMermaidDocument(
    mermaidDocument: MermaidDocument
  ): Promise<void> {
    this._viewStateStore.dispatch(
      createChangeMermaidDocumentEvent(mermaidDocument)
    );
  }

  public async onDidChangePreviewConfig(
    e: PreviewConfigChangeEvent
  ): Promise<void> {
    switch (e.property) {
      case PreviewConfigProperty.BackgroundColor:
        this._viewStateStore.dispatch(
          createChangePreviewConfigBackgroundColorEvent(e.config)
        );
        break;
      case PreviewConfigProperty.DefaultMermaidConfig:
        this._viewStateStore.dispatch(
          createChangePreviewConfigDefaultMermaidConfigEvent(e.config)
        );
        break;
    }
  }
}

export default MainController;
