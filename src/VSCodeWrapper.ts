import * as vscode from 'vscode';

export default class VSCodeWrapper {
  public get activeTextEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  public get onDidChangeTextDocument(): vscode.Event<
    vscode.TextDocumentChangeEvent
  > {
    return vscode.workspace.onDidChangeTextDocument;
  }

  public get onDidChangeActiveTextEditor(): vscode.Event<
    vscode.TextEditor | undefined
  > {
    return vscode.window.onDidChangeActiveTextEditor;
  }

  public get workspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
    return vscode.workspace.workspaceFolders;
  }

  public getWorkspaceFolder(
    uri: vscode.Uri
  ): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.getWorkspaceFolder(uri);
  }

  public createOutputChannel(channelName: string): vscode.OutputChannel {
    return vscode.window.createOutputChannel(channelName);
  }

  public getConfiguration(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
  }

  public executeCommand<T>(
    command: string,
    ...rest: any[]
  ): Thenable<T | undefined> | undefined {
    return vscode.commands.executeCommand<T>(command, ...rest);
  }

  public async setContext(contextSection: string, value: any): Promise<void> {
    await this.executeCommand('setContext', contextSection, value);
  }
}
