// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as constants from './constants';
import Logger from './Logger';
import MainController from './controllers/mainController';
import fetch from 'cross-fetch';

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
import ProgressStatusBar, {
  PROGRESS_GENERATING_IMAGE,
  PROGRESS_FETCHING_LIBRARY
} from './ProgressStatusBar';
import MermaidLibraryProvider from './models/MermaidLibraryProvider';
import { MermaidLibraryChangeEvent } from './controllers/MermaidLibraryService';

const fetchLatestLibraryUri = async () => {
  try {
    // TODO: should show progress in status bar
    const res = await fetch(
      'https://api.cdnjs.com/libraries/mermaid?fields=version,latest'
    );
    if (!res.ok) {
      throw new Error(
        `Failure response from server (${res.status}, ${res.statusText})`
      );
    }
    const fields = await res.json();
    return fields;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'unknown error during accessing cdnjs.com';
    vscode.window.showErrorMessage(message);
  }
  return {};
};

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

  const generatorProgressItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  generatorProgressItem.text = '$(sync) generating image...';
  ProgressStatusBar.setStatusBarItem(
    PROGRESS_GENERATING_IMAGE,
    generatorProgressItem
  );

  const fetchProgressItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  fetchProgressItem.text = '$(sync) getting the CDN information...';
  ProgressStatusBar.setStatusBarItem(
    PROGRESS_FETCHING_LIBRARY,
    fetchProgressItem
  );

  const mermaidLibraryProvider = new MermaidLibraryProvider(
    context.extensionPath,
    context.globalState,
    vscodeWrapper
  );
  mermaidLibraryProvider.onDidChangeMermaidLibrary(
    (event: MermaidLibraryChangeEvent) => {
      mainController.dispose();
    }
  );

  const webViewManager = new WebViewManager(
    context.extensionPath,
    vscodeWrapper,
    vscodeWrapper,
    mermaidLibraryProvider
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
    mainController.captureImage('file')
  );
  registerCommand(context, constants.COMMAND_COPY_IMAGE, () =>
    mainController.captureImage('clipboard')
  );
  registerCommand(
    context,
    constants.COMMAND_UPDATE_MERMAID_LIBRARY,
    async () => {
      try {
        ProgressStatusBar.show(PROGRESS_FETCHING_LIBRARY);
        const { latest, version } = await fetchLatestLibraryUri();
        ProgressStatusBar.hide(PROGRESS_FETCHING_LIBRARY);

        if (latest) {
          mermaidLibraryProvider.setLibrary(latest, version);
          vscode.window.showInformationMessage(
            constants.MESSAGE_UPDATE_MERMAID_LIBRARY(version)
          );
        }
      } catch (e) {
        vscode.window.showErrorMessage('test: error');
      }
    }
  );
  registerCommand(context, constants.COMMAND_RESET_MERMAID_LIBRARY, () => {
    mermaidLibraryProvider.clearLibrary();
    vscode.window.showInformationMessage(
      constants.MESSAGE_RESET_MERMAID_LIBRARY
    );
  });
  registerCommand(context, constants.COMMAND_SET_MERMAID_LIBRARY, async () => {
    const text = await vscode.window.showInputBox();
    if (text) {
      try {
        mermaidLibraryProvider.setLibrary(text);
        vscode.window.showInformationMessage(
          constants.MESSAGE_UPDATE_MERMAID_LIBRARY('the user value')
        );
      } catch (e) {
        vscode.window.showErrorMessage('test: error');
      }
    }
  });
}

export function deactivate(): void {
  mainController.dispose();
  Logger.dispose();
  ProgressStatusBar.dispose();
}
