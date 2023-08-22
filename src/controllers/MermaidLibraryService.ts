import * as vscode from 'vscode';

export interface MermaidLibraryChangeEvent {
  version: string | undefined;
  uri: vscode.Uri | undefined;
}

export default interface MermaidLibraryService {
  readonly libraryVersion: Promise<string>;
  readonly libraryUri: vscode.Uri;
  readonly isIntegratedLibraryUsed: boolean;
  setLibrary(path: string, version?: string): void;
  resetLibrary(): void;
  onDidChangeMermaidLibrary: vscode.Event<MermaidLibraryChangeEvent>;
}
