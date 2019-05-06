import * as vscode from 'vscode';

export default class Logger {
  private static readonly LOG_OUTPUT_CHANNEL = 'mermaid-editor';
  private static _instance: Logger | undefined;
  private readonly _channel: vscode.OutputChannel;

  public static instance() {
    if (!this._instance) {
      this._instance = new Logger();
    }
    return this._instance;
  }

  public static dispose() {
    if (!this._instance) return;

    this._instance._channel.dispose();
    this._instance = undefined;
  }

  public appendLine(message: string) {
    this._channel.appendLine(message);
  }

  public show() {
    this._channel.show();
  }

  private constructor() {
    this._channel = vscode.window.createOutputChannel(
      Logger.LOG_OUTPUT_CHANNEL
    );
  }
}
