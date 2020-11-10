import * as vscode from 'vscode';

export default interface FileSystemService {
  readonly workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;
  getWorkspaceFolder(uri: vscode.Uri): vscode.WorkspaceFolder | undefined;
  file(path: string): vscode.Uri;
  readFile(uri: vscode.Uri): Promise<string>;
  writeFile(uri: vscode.Uri, data: Uint8Array): Promise<void>;
}
