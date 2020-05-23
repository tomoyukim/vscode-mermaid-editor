import * as vscode from 'vscode';

export default class Logger {
  private static readonly LOG_OUTPUT_CHANNEL = 'mermaid-editor';
  private static readonly LOG_OUTPUT_DIVIDER =
    '\n============================\n';
  private static _instance: Logger | undefined;
  private readonly _channel: vscode.OutputChannel;

  public static instance(): Logger {
    if (!this._instance) {
      this._instance = new Logger();
    }
    return this._instance;
  }

  public static dispose(): void {
    if (!this._instance) {
      return;
    }

    this._instance._channel.dispose();
    this._instance = undefined;
  }

  public appendLine(message: string): void {
    this._channel.appendLine(message);
  }

  public appendDivider(): void {
    this._channel.appendLine(Logger.LOG_OUTPUT_DIVIDER);
  }

  public clear(): void {
    this._channel.clear();
  }

  public show(): void {
    this._channel.show(true);
  }

  private constructor() {
    this._channel = vscode.window.createOutputChannel(
      Logger.LOG_OUTPUT_CHANNEL
    );
  }
}
