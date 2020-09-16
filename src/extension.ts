// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; // TODO: replace with wrapper
import * as constants from './constants';
import VSCodeWrapper from './VSCodeWrapper';
import Previewer from './Previewer';
import * as generator from './fileGenerator';
import Logger from './Logger';
import { isMermaid } from './util';
import get from 'lodash/get';

export function activate(context: vscode.ExtensionContext): void {
  const vscodeWrapper = new VSCodeWrapper();
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
              Logger.instance().appendLine(e.message);
              vscode.window.showErrorMessage(e.message);
            })
            .finally(() => {
              statusBarItem.hide();
              Logger.instance().show();
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

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview',
      () =>
        isMermaid(get(vscode.window.activeTextEditor, 'document')) &&
        Previewer.createOrShow(context.extensionPath)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview.zoomin',
      () => Previewer.currentPanel && Previewer.currentPanel.zoomIn()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview.zoomout',
      () => Previewer.currentPanel && Previewer.currentPanel.zoomOut()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview.zoomreset',
      () => Previewer.currentPanel && Previewer.currentPanel.zoomReset()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview.zoomto',
      async () => {
        const value = await vscode.window.showInputBox({
          placeHolder: 'scale'
        });
        if (value) {
          Previewer.currentPanel &&
            Previewer.currentPanel.zoomTo(parseFloat(value));
        }
      }
    )
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    vscode.window.registerWebviewPanelSerializer(Previewer.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        Previewer.revive(webviewPanel, state, context.extensionPath);
      }
    });
  }
}

export function deactivate(): void {
  Logger.dispose();
}
