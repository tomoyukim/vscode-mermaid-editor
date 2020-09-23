import * as vscode from 'vscode';
import VSCodeWrapper from './VSCodeWrapper';
import * as constants from './constants';

export default class Logger {
  private static _outputChannel: vscode.OutputChannel;
  private readonly _vscodeWrapper: VSCodeWrapper;

  constructor() {
    this._vscodeWrapper = new VSCodeWrapper();
    if (typeof Logger._outputChannel === 'undefined') {
      Logger._outputChannel = this._vscodeWrapper.createOutputChannel(
        constants.LOG_OUTPUT_CHANNEL
      );
    }
  }

  public static dispose(): void {
    this._outputChannel.dispose();
  }

  public appendLine(message: string): void {
    Logger._outputChannel.appendLine(message);
  }

  public appendDivider(): void {
    Logger._outputChannel.appendLine(constants.LOG_OUTPUT_DIVIDER);
  }

  public clear(): void {
    Logger._outputChannel.clear();
  }

  public show(): void {
    Logger._outputChannel.show(true);
  }

  public outputError(message: string): void {
    this.appendLine(message);
    this.appendDivider();
    this.show();
  }
}
