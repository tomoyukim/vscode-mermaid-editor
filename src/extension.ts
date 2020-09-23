// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; // TODO: replace with wrapper
import * as constants from './constants';
import VSCodeWrapper from './VSCodeWrapper';
import Previewer from './controllers/Previewer';
import * as generator from './controllers/fileGenerator';
import Logger from './Logger';
import { isMermaid } from './util';
import get from 'lodash/get';
import PreviewController from './controllers/PreviewController';

let previewController: PreviewController;

export function activate(context: vscode.ExtensionContext): void {
  const vscodeWrapper = new VSCodeWrapper();
  const logger = new Logger();

  previewController = new PreviewController(context);

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = constants.STATUSBAR_MESSAGE_GENERATE_IMAGE;
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-editor.generate', () => {
      if (
        isMermaid(get(vscode.window.activeTextEditor, 'document')) &&
        Previewer.currentPanel
      ) {
        Previewer.currentPanel.onTakeImage((data, type) => {
          statusBarItem.show();
          generator
            .outputFile(context, data, type)
            .then(() => {
              vscode.window.showInformationMessage(
                `mermaid-editor: generated!`
              );
              statusBarItem.hide();
            })
            .catch(e => {
              logger.appendLine(e.message);
              vscode.window.showErrorMessage(e.message);
            })
            .finally(() => {
              statusBarItem.hide();
              logger.show();
            });
        });
        Previewer.currentPanel.onFailTakeImage(() => {
          vscode.window.showErrorMessage('Fail to generate image.');
        });
        Previewer.currentPanel.takeImage(
          vscodeWrapper.getConfiguration(constants.CONFIG_SECTION_ME_GENERATE)
        );
      }
    })
  );
}

export function deactivate(): void {
  previewController.dispose();
  Logger.dispose();
}
