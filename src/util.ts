import * as vscode from 'vscode';

const MERMAID_LANGUAGE_ID = 'mermaid';

export function isMermaid(document: vscode.TextDocument | undefined): boolean {
  if (!document) {
    return false;
  }
  return document.languageId === MERMAID_LANGUAGE_ID;
}
