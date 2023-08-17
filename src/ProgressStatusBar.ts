import * as vscode from 'vscode';

export const PROGRESS_GENERATING_IMAGE = 0;
export const PROGRESS_FETCHING_LIBRARY = 1;

class ProgressStatusBar {
  private static _statusBarItem: vscode.StatusBarItem[] = [];

  public static setStatusBarItem(
    key: number,
    statusBarItem: vscode.StatusBarItem
  ): void {
    this._statusBarItem[key] = statusBarItem;
  }
  public static show(key: number): void {
    this._statusBarItem[key]?.show();
  }
  public static hide(key: number): void {
    this._statusBarItem[key]?.hide();
  }

  public static dispose(): void {
    this._statusBarItem.forEach(item => item?.dispose());
    this._statusBarItem = [];
  }
}

export default ProgressStatusBar;
