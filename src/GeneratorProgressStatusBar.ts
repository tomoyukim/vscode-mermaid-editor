import * as vscode from 'vscode';

class GeneratorProgressStatusBar {
  private static _statusBarItem: vscode.StatusBarItem | undefined;

  public static setStatusBarItem(statusBarItem: vscode.StatusBarItem): void {
    this._statusBarItem = statusBarItem;
    this._statusBarItem.text = '$(sync) generating image...';
  }
  public static show(): void {
    this._statusBarItem?.show();
  }
  public static hide(): void {
    this._statusBarItem?.hide();
  }

  public static dispose(): void {
    this._statusBarItem?.dispose();
    this._statusBarItem = undefined;
  }
}

export default GeneratorProgressStatusBar;
