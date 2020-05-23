// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Previewer from './Previewer';
import Generator from './Generator';
import Logger from './Logger';
import { isMermaid } from './util';
import get from 'lodash/get';

export function activate(context: vscode.ExtensionContext): void {
  const generator = new Generator(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-editor.generate', () => {
      if (
        isMermaid(get(vscode.window.activeTextEditor, 'document')) &&
        Previewer.currentPanel
      ) {
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
