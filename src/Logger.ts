import VSCodeWrapper from './VSCodeWrapper';
import * as constants from './constants';

export default class Logger {
  private static _instance: Logger | undefined;
  private readonly _vscodeWrapper: VSCodeWrapper;

  // TODO: remove singleton
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

    this._instance._vscodeWrapper.outputChannel.dispose();
    this._instance = undefined;
  }

  public appendLine(message: string): void {
    this._vscodeWrapper.logToOutputChannel(message);
  }

  public appendDivider(): void {
    this._vscodeWrapper.logToOutputChannel(constants.LOG_OUTPUT_DIVIDER);
  }

  public clear(): void {
    this._vscodeWrapper.outputChannel.clear();
  }

  public show(): void {
    this._vscodeWrapper.outputChannel.show(true);
  }

  private constructor() {
    this._vscodeWrapper = new VSCodeWrapper();
  }
}
