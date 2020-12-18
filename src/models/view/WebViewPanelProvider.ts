import * as vscode from 'vscode';

export default interface WebViewPanelProvider {
  createWebviewPanel(
    viewType: string,
    title: string,
    showOptions:
      | vscode.ViewColumn
      | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean },
    options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ): vscode.WebviewPanel;
  registerWebviewPanelSerializer(
    viewType: string,
    serializer: vscode.WebviewPanelSerializer
  ): vscode.Disposable;
}
