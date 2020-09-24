// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Logger from './Logger';
import PreviewController from './controllers/PreviewController';

let previewController: PreviewController;

export function activate(context: vscode.ExtensionContext): void {
  previewController = new PreviewController(context);
}

export function deactivate(): void {
  previewController.dispose();
  Logger.dispose();
}
