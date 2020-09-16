import * as vscode from 'vscode';
import * as constants from './constants';

export default class VSCodeWrapper {
  private static _outputChannel: vscode.OutputChannel;

  constructor() {
    if (typeof VSCodeWrapper._outputChannel === 'undefined') {
      VSCodeWrapper._outputChannel = this.createOutputChannel(
        constants.LOG_OUTPUT_CHANNEL
      );
    }
  }

  public get activeTextEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  public getWorkspaceFolder(
    uri: vscode.Uri
  ): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.getWorkspaceFolder(uri);
  }

  public createOutputChannel(channelName: string): vscode.OutputChannel {
    return vscode.window.createOutputChannel(channelName);
  }

  public logToOutputChannel(message: string): void {
    VSCodeWrapper._outputChannel.appendLine(message);
  }

  public get outputChannel(): vscode.OutputChannel {
    return VSCodeWrapper._outputChannel;
  }

  public getConfiguration(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
  }
}
