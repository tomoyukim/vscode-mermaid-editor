// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Previewer from './Previewer';
import Generator from './Generator';
import Logger from './Logger';

function isMmd() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return false;

  return /\.mmd$/.test(editor.document.fileName);
}

export function activate(context: vscode.ExtensionContext) {
  const generator = new Generator(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.generate',
      () => isMmd() && generator.generate()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-editor.preview',
      () => isMmd() && Previewer.createOrShow(context.extensionPath)
    )
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    vscode.window.registerWebviewPanelSerializer(Previewer.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        Previewer.revive(webviewPanel, context.extensionPath);
      }
    });
  }
}

export function deactivate() {
  Logger.dispose();
}
