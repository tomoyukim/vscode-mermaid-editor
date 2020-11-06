import * as vscode from 'vscode';
import TextDocumentProvider from './models/editor/TextDocumentProvider';
import ConfigurationProvider from './models/configration/ConfigurationProvider';
import FileSystemService from './models/FileSystemService';
import { TextDecoder } from 'util';

export default class VSCodeWrapper
  implements TextDocumentProvider, ConfigurationProvider, FileSystemService {
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

  public createWebviewPanel(
    viewType: string,
    title: string,
    showOptions:
      | vscode.ViewColumn
      | { viewColumn: vscode.ViewColumn; preserveFocus?: boolean },
    options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel(
      viewType,
      title,
      showOptions,
      options
    );
  }

  public async showInputBox(
    option?: vscode.InputBoxOptions
  ): Promise<string | undefined> {
    return vscode.window.showInputBox(option);
  }

  public registerWebviewPanelSerializer(
    viewType: string,
    serializer: vscode.WebviewPanelSerializer
  ): vscode.Disposable {
    return vscode.window.registerWebviewPanelSerializer(viewType, serializer);
  }

  public registerCommand(
    command: string,
    callback: () => void
  ): vscode.Disposable {
    return vscode.commands.registerCommand(command, callback);
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

  // ConfigurationProvider
  public getConfiguration(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
  }

  public get onDidChangeConfiguration(): vscode.Event<
    vscode.ConfigurationChangeEvent
  > {
    return vscode.workspace.onDidChangeConfiguration;
  }

  // TextDocumentProvider
  public get activeTextDocument(): vscode.TextDocument | undefined {
    return vscode.window.activeTextEditor?.document;
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

  // FileSystemService
  public get workspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
    return vscode.workspace.workspaceFolders;
  }

  public file(path: string): vscode.Uri {
    return vscode.Uri.file(path);
  }

  public async readFile(uri: vscode.Uri): Promise<string> {
    const config = await vscode.workspace.fs.readFile(uri);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(config);
  }
}
