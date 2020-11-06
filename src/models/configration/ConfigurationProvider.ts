import * as vscode from 'vscode';

export default interface ConfigurationProvider {
  getConfiguration(section: string): vscode.WorkspaceConfiguration;
  readonly onDidChangeConfiguration: vscode.Event<
    vscode.ConfigurationChangeEvent
  >;
}
