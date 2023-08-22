import { Store } from 'redux';
import * as path from 'path';
import * as constants from '../constants';
import isEmpty = require('lodash/isEmpty');
import isNumber = require('lodash/isNumber');
import isNaN = require('lodash/isNaN');
import toNumber = require('lodash/toNumber');
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
import WebViewManager from '../view/WebViewManager';
import DiagramWebView from '../view/DiagramWebView';
import {
  CaptureImageTarget,
  DiagramWebViewRenderParams,
  ErrorEvent
} from '../view/DiagramWebViewTypes';
import { GeneratorConfigProperty } from '../models/configration/GeneratorConfigProvider';
import GeneratorConfigProvider from '../models/configration/GeneratorConfigProvider';
import FileGeneratorService from '../models/FileGeneratorService';
import { CaptureImageEndEvent } from '../view/DiagramWebViewTypes';
import SystemCommandService from './SystemCommandService';
import MermaidConfigService from '../models/configration/MermaidConfigService';
import Logger from '../Logger';
import { PopupViewProvider } from './PopupViewProvider';
import ProgressStatusBar, {
  PROGRESS_GENERATING_IMAGE
} from '../ProgressStatusBar';
import Queue from '../utils/Queue';

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
  const mermaidDocument = viewState.mermaidDocument;
  if (!isEmpty(mermaidDocument.code.attribute.pathToConfig)) {
    return path.join(
      mermaidDocument.currentDir,
      mermaidDocument.code.attribute.pathToConfig
    );
  }
  return defaultMermaidConfig;
};

// for test
export const isPositiveNumberStr = (str: string): boolean => {
  if (isEmpty(str)) {
    return false;
  }
  const num = toNumber(str);
  if (isNaN(num)) {
    return false;
  }
  if (!isNumber(num)) {
    return false;
  }
  return num > 0;
};

class MainController {
  private _timer: NodeJS.Timeout | null;
  private _viewStateStore: Store<ViewState, ViewStateAction>;
  private _errorMessageQueue: Queue<string>;
  private _diagramWebView: DiagramWebView | undefined;
  private _webViewManager: WebViewManager;
  private _mermaidDocumentProvider: MermaidDocumentProvider;
  private _previewConfigProvider: PreviewConfigProvider;
  private _generatorConfigProvider: GeneratorConfigProvider;
  private _mermaidConfigService: MermaidConfigService;
  private _fileGeneratorService: FileGeneratorService;
  private _systemCommandService: SystemCommandService;
  private _popupViewProvider: PopupViewProvider;

  constructor(
    viewStateStore: Store<ViewState, ViewStateAction>,
    webViewManager: WebViewManager,
    mermaidDocumentProvider: MermaidDocumentProvider,
    previewConfigProvider: PreviewConfigProvider,
    generatorConfigProvider: GeneratorConfigProvider,
    mermaidConfigService: MermaidConfigService,
    fileGeneratorService: FileGeneratorService,
    systemCommandService: SystemCommandService,
    popupViewProvider: PopupViewProvider
  ) {
    this._timer = null;
    this._viewStateStore = viewStateStore;
    this._errorMessageQueue = new Queue<string>();

    this._webViewManager = webViewManager;
    this._mermaidDocumentProvider = mermaidDocumentProvider;
    this._previewConfigProvider = previewConfigProvider;
    this._generatorConfigProvider = generatorConfigProvider;
    this._mermaidConfigService = mermaidConfigService;
    this._fileGeneratorService = fileGeneratorService;
    this._systemCommandService = systemCommandService;
    this._popupViewProvider = popupViewProvider;

    this._webViewManager.onDidChangeWebView(e =>
      this.onDidChangeWebView(e.webView)
    );

    this._mermaidDocumentProvider.onDidChangeMermaidDocument(e =>
      this.onDidChangeMermaidDocument(e.mermaidDocument)
    );

    this._mermaidDocumentProvider.onDidSaveMermaidDocument(() =>
      this.onDidSaveMermaidDocument()
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

  private async _setupWebView(): Promise<void> {
    this._diagramWebView?.onDidChangeViewStateActivity(isActive => {
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_ACTIVE, isActive);
      // TODO: initWebView?
    });
    this._diagramWebView?.onDidChangeViewStateVisibility(isVisible => {
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_VISIBLE, isVisible);
    });
    this._diagramWebView?.onDidCaptureImage(e => this.onDidCaptureImage(e));
    this._diagramWebView?.onDidError((error: ErrorEvent) => {
      switch (error.kind) {
        case 'error/diagram-parse':
          this._errorMessageQueue.enqueue(
            `[DiagramParseError]\n${error.message}`
          );
          break;
        case 'error/mermaid-config-json-parse':
          this._errorMessageQueue.enqueue(
            `[MermaidConfigJSONParseError]\n${error.message}`
          );
          break;
        case 'error/renderer':
          this._errorMessageQueue.enqueue(`[RendererError]\n${error.message}`);
          break;
        default:
          this._errorMessageQueue.enqueue(
            `unknown error: ${JSON.stringify(error)}`
          );
          break;
      }
    });
    this._diagramWebView?.onDidViewRenderRequested(() => {
      this._errorMessageQueue.clear();
      Logger.clear();
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

    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ENABLED, false);
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_ACTIVE, false);
    this._setContext(constants.CONTEXT_SECTION_PREVIEW_VISIBLE, false);

    this._diagramWebView?.dispose();
  }

  // commands
  public async showPreview(): Promise<void> {
    if (!this._diagramWebView) {
      this._diagramWebView = this._webViewManager.webView;
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_ENABLED, true);
      this._setContext(
        constants.CONTEXT_SECTION_PREVIEW_ACTIVE,
        this._diagramWebView.active
      );
      this._setContext(
        constants.CONTEXT_SECTION_PREVIEW_VISIBLE,
        this._diagramWebView.visible
      );
      await this._setupWebView();
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
    const value = await this._popupViewProvider.showInputBox({
      placeHolder: 'scale'
    });
    if (value) {
      this._diagramWebView?.zoomTo(parseFloat(value));
    }
  }

  public async captureImage(target: CaptureImageTarget): Promise<void> {
    const config = this._generatorConfigProvider.getConfig(
      GeneratorConfigProperty.ImageConfig
    );

    if (config?.kind === 'imageConfig') {
      const outputScale = this._mermaidDocumentProvider.document.code.attribute
        .outputScale;

      let scale =
        config.value.scale > 0
          ? config.value.scale
          : constants.GEMERATE_IMAGE_SCALE_DEFAULT;
      if (isPositiveNumberStr(outputScale)) {
        scale = toNumber(outputScale);
      }

      this._diagramWebView?.captureImage({
        type: config.value.type,
        scale,
        quality: config.value.quality,
        target
      });
      ProgressStatusBar.show(PROGRESS_GENERATING_IMAGE);
    }
  }

  // callbacks
  public async onDidCaptureImage(e: CaptureImageEndEvent): Promise<void> {
    if (e.kind === 'capture_image/failure') {
      Logger.appendLine('[CaptureImageFailure]');
      Logger.appendLine(e.error.message);
      Logger.show();
      this._popupViewProvider.showErrorMessage(
        constants.MESSAGE_GENERATE_IMAGE_FAILURE
      );
    } else if (e.kind === 'copy_image_clipboard') {
      this._popupViewProvider.showInformationMessage(
        constants.MESSAGE_COPY_IMAGE_CLIPBOARD
      );
    } else {
      const config = this._generatorConfigProvider.getConfig(
        GeneratorConfigProperty.OutputPath
      );
      let outputPath = this._mermaidDocumentProvider.document.currentDir;
      if (config !== undefined && config.kind === 'outputPath') {
        outputPath = config.value;
      }
      const fileName = this._mermaidDocumentProvider.document.fileName;
      try {
        await this._fileGeneratorService.outputFile(
          e.data,
          outputPath,
          fileName,
          e.type
        );
        this._popupViewProvider.showInformationMessage(
          constants.MESSAGE_GENERATE_IMAGE_SUCCESS
        );
      } catch (error) {
        if (error instanceof Error) {
          Logger.appendLine('[OutputFileFailure]');
          Logger.appendLine(error.message);
          Logger.show();
        }
        this._popupViewProvider.showErrorMessage(
          constants.MESSAGE_GENERATE_IMAGE_FAILURE
        );
      }
    }
    ProgressStatusBar.hide(PROGRESS_GENERATING_IMAGE);
  }

  public async onDidChangeWebView(
    webView: DiagramWebView | undefined
  ): Promise<void> {
    this._diagramWebView = webView;

    if (!this._diagramWebView) {
      // disposed
      this.dispose();
    } else {
      // new webView instnce alive
      this._setContext(constants.CONTEXT_SECTION_PREVIEW_ENABLED, true);
      this._setContext(
        constants.CONTEXT_SECTION_PREVIEW_ACTIVE,
        this._diagramWebView.active
      );
      this._setContext(
        constants.CONTEXT_SECTION_PREVIEW_VISIBLE,
        this._diagramWebView.visible
      );
      await this._setupWebView();
    }
  }

  public async onDidChangeMermaidDocument(
    mermaidDocument: MermaidDocument
  ): Promise<void> {
    this._viewStateStore.dispatch(
      createChangeMermaidDocumentEvent(mermaidDocument)
    );
  }

  public async onDidSaveMermaidDocument(): Promise<void> {
    if (this._errorMessageQueue.size() === 0) {
      return;
    }

    while (this._errorMessageQueue.peek() !== undefined) {
      const message = this._errorMessageQueue.dequeue();
      message && Logger.appendLine(message);
    }

    if (this._previewConfigProvider.errorOutputOnSave) {
      Logger.show();
    }
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
