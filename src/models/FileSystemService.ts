import * as vscode from 'vscode';

export default interface FileSystemService {
  readonly workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;
  file(path: string): vscode.Uri;
  readFile(uri: vscode.Uri): Promise<string>;
}
