import * as vscode from 'vscode';

export interface TextDocumentChangeEvent {
  document: vscode.TextDocument;
}

export default interface TextDocumentProvider {
  readonly activeTextDocument: vscode.TextDocument | undefined;
  readonly onDidChangeTextDocument: vscode.Event<TextDocumentChangeEvent>;
  readonly onDidChangeActiveTextEditor: vscode.Event<
    vscode.TextEditor | undefined
  >;
  readonly onDidSaveTextDocument: vscode.Event<vscode.TextDocument | undefined>;
}
