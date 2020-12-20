import * as vscode from 'vscode';
import TextDocumentProvider from './models/editor/TextDocumentProvider';
import ConfigurationProvider from './models/configration/ConfigurationProvider';
import FileSystemService from './models/FileSystemService';
import { TextDecoder } from 'util';
import WebViewPanelProvider from './view/WebViewPanelProvider';
import SystemCommandService from './controllers/SystemCommandService';
import { PopupViewProvider } from './controllers/PopupViewProvider';

export default class VSCodeWrapper
  implements
    TextDocumentProvider,
    ConfigurationProvider,
    FileSystemService,
    SystemCommandService,
    PopupViewProvider,
    WebViewPanelProvider {
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

  // PopupViewProvider
  public async showInputBox(
    option?: vscode.InputBoxOptions
  ): Promise<string | undefined> {
    return vscode.window.showInputBox(option);
  }

  public async showInformationMessage(
    message: string
  ): Promise<string | undefined> {
    return vscode.window.showInformationMessage(message);
  }

  public async showErrorMessage(message: string): Promise<string | undefined> {
    return vscode.window.showErrorMessage(message);
  }

  // SystemCommandService
  public executeCommand<T>(
    command: string,
    ...rest: any[]
  ): Thenable<T | undefined> | undefined {
    return vscode.commands.executeCommand<T>(command, ...rest);
  }

  // WebViewPanelProvider
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

  public registerWebviewPanelSerializer(
    viewType: string,
    serializer: vscode.WebviewPanelSerializer
  ): vscode.Disposable {
    return vscode.window.registerWebviewPanelSerializer(viewType, serializer);
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

  public async writeFile(uri: vscode.Uri, data: Uint8Array): Promise<void> {
    await vscode.workspace.fs.writeFile(uri, data);
  }
}
