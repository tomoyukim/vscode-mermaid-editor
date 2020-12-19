import * as vscode from 'vscode';
import * as constants from './constants';

export default class Logger {
  private static _outputChannel: vscode.OutputChannel | undefined;

  public static setOutputChannel(outputChannel: vscode.OutputChannel): void {
    this._outputChannel = outputChannel;
  }

  public static dispose(): void {
    this._outputChannel?.dispose();
  }

  public static appendLine(message: string): void {
    Logger._outputChannel?.appendLine(message);
  }

  public static appendDivider(): void {
    Logger._outputChannel?.appendLine(constants.LOG_OUTPUT_DIVIDER);
  }

  public static clear(): void {
    Logger._outputChannel?.clear();
  }

  public static show(): void {
    Logger._outputChannel?.show(true);
  }

  public static outputError(message: string): void {
    this.appendLine(message);
    this.appendDivider();
    this.show();
  }
}
