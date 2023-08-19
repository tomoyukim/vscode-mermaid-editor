import * as vscode from 'vscode';
import MermaidLibraryProvider from '../models/MermaidLibraryProvider';

const KEY_MERMAID_LIBRARY = 'mermaidLibrary';
const KEY_MERMAID_LIBRARY_VERSION = 'mermaidLibraryVersion';

export interface MermaidLibraryChangeEvent {
  version: string | undefined;
  uri: vscode.Uri | undefined;
}

export default interface MermaidLibraryService {
  readonly libraryVersion: Promise<string>;
  readonly libraryUri: vscode.Uri;
  readonly isIntegratedLibraryUsed: boolean;
  setLibrary(path: string, version?: string): void;
  clearLibrary(): void;
  onDidChangeMermaidLibrary: vscode.Event<MermaidLibraryChangeEvent>;
}
