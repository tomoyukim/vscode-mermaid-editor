// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as constants from './constants';
import Logger from './Logger';
import MainController from './controllers/mainController';

import viewStateStore from './controllers/viewStateStore';
import WebViewManager from './view/WebViewManager';
import VSCodeWrapper from './VSCodeWrapper';
import MermaidDocumentProvider from './models/editor/MermaidDocumentProvider';
import AttributeParseService from './models/editor/AttributeParseService';
import PreviewConfigProvider, {
  PreviewConfigProperty
} from './models/configration/PreviewConfigProvider';
import GeneratorConfigProvider from './models/configration/GeneratorConfigProvider';
import MermaidConfigService from './models/configration/MermaidConfigService';
import FileGeneratorService from './models/FileGeneratorService';
import GeneratorProgressStatusBar from './GeneratorProgressStatusBar';

function registerCommand(
  context: vscode.ExtensionContext,
  command: string,
  callback: () => void
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(command, callback)
  );
}

let mainController: MainController;

export function activate(context: vscode.ExtensionContext): void {
  const vscodeWrapper = new VSCodeWrapper();

  Logger.setOutputChannel(
    vscodeWrapper.createOutputChannel(constants.LOG_OUTPUT_CHANNEL)
  );

  GeneratorProgressStatusBar.setStatusBarItem(
    vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  );

  const webViewManager = new WebViewManager(
    context.extensionPath,
    vscodeWrapper,
    vscodeWrapper
  );
  const mermaidDocumentProvider = new MermaidDocumentProvider(
    vscodeWrapper,
    new AttributeParseService(() => {
      vscodeWrapper.showInformationMessage(
        'The attribute syntax with curly brackets was deprecated. Please use parenthesis instead.'
      );
    })
  );
  const generateConfigProvider = new GeneratorConfigProvider(
    vscodeWrapper,
    vscodeWrapper,
    vscodeWrapper
  );
  const mermaidConfigService = new MermaidConfigService(vscodeWrapper);
  const previewConfigProvider = new PreviewConfigProvider(vscodeWrapper);
  const fileGeneratorService = new FileGeneratorService(vscodeWrapper);

  const initialState = {
    mermaidDocument: mermaidDocumentProvider.document,
    defaultMermaidConfig: previewConfigProvider.getConfig(
      PreviewConfigProperty.DefaultMermaidConfig
    ),
    backgroundColor: previewConfigProvider.getConfig(
      PreviewConfigProperty.BackgroundColor
    )
  };

  mainController = new MainController(
    viewStateStore(initialState),
    webViewManager,
    mermaidDocumentProvider,
    previewConfigProvider,
    generateConfigProvider,
    mermaidConfigService,
    fileGeneratorService,
    vscodeWrapper,
    vscodeWrapper
  );
  // register commands
  registerCommand(context, constants.COMMAND_PREVIEW_SHOW, () =>
    mainController.showPreview()
  );
  registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_IN, () =>
    mainController.zoomIn()
  );
  registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_OUT, () =>
    mainController.zoomOut()
  );
  registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_RESET, () =>
    mainController.zoomReset()
  );
  registerCommand(context, constants.COMMAND_PREVIEW_ZOOM_TO, () =>
    mainController.zoomTo()
  );
  registerCommand(context, constants.COMMAND_GENERATE_IMAGE, () =>
    mainController.captureImage()
  );
}

export function deactivate(): void {
  mainController.dispose();
  Logger.dispose();
  GeneratorProgressStatusBar.dispose();
}
