import * as vscode from 'vscode';

export interface PopupViewProvider {
  showErrorMessage(message: string): Promise<string | undefined>;
  showInformationMessage(message: string): Promise<string | undefined>;
  showInputBox(option?: vscode.InputBoxOptions): Promise<string | undefined>;
}
