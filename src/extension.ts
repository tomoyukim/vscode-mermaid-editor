// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Previewer from './Previewer';
import Generator from './Generator';
import Logger from './Logger';
import { isMermaid } from './util';

export function activate(context: vscode.ExtensionContext) {
  const generator = new Generator(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-editor.generate', () => {
      if (isMermaid(vscode.window.activeTextEditor) && Previewer.currentPanel) {
        Previewer.currentPanel.onTakeImage((data, type) => {
          generator.generate(data, type);
        });
        Previewer.currentPanel.takeImage(Generator.getConfiguration());
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview',
      () =>
        isMermaid(vscode.window.activeTextEditor) &&
        Previewer.createOrShow(context.extensionPath)
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

export function deactivate() {
  Logger.dispose();
}
