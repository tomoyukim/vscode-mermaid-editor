import * as vscode from 'vscode';
import MermaidLibraryProvider from '../models/MermaidLibraryProvider';

const KEY_MERMAID_LIBRARY = 'mermaidLibrary';
const KEY_MERMAID_LIBRARY_VERSION = 'mermaidLibraryVersion';

export interface MermaidLibraryChangeEvent {
  version: string | undefined;
  uri: vscode.Uri | undefined;
}

export default class MermaidLibraryService {
  private _eventEmitter: vscode.EventEmitter<MermaidLibraryChangeEvent>;
  private _mermaidLibraryProvider: MermaidLibraryProvider;
  private _globalState: vscode.Memento;
  private _whiteList: string[];

  constructor(
    mermaidLibraryProvider: MermaidLibraryProvider,
    globalState: vscode.Memento
  ) {
    this._eventEmitter = new vscode.EventEmitter<MermaidLibraryChangeEvent>();
    this._mermaidLibraryProvider = mermaidLibraryProvider;
    this._globalState = globalState;
    this._whiteList = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
  }

  public get libraryVersion() {
    const libraryVersion = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY_VERSION
    );
    if (libraryVersion) {
      return libraryVersion;
    } else {
      return this._mermaidLibraryProvider.getIntegratedLibraryVersion();
    }
  }

  public get libraryUri(): vscode.Uri {
    const libraryPath = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY
    );
    if (libraryPath) {
      return vscode.Uri.parse(libraryPath);
    } else {
      return this._mermaidLibraryProvider.getIntegratedLibraryUri();
    }
  }

  public setLibrary(path: string, version?: string) {
    const libraryUri = vscode.Uri.parse(path, true);
    if (!this._whiteList.includes(libraryUri.authority)) {
      throw new Error(`${path} is not supported.`);
    }
    this._globalState.update(KEY_MERMAID_LIBRARY, libraryUri.toString());
    this._globalState.update(KEY_MERMAID_LIBRARY_VERSION, version);
    this._eventEmitter.fire({
      version,
      uri: libraryUri
    });
  }

  public clearLibrary() {
    this._globalState.update(KEY_MERMAID_LIBRARY, undefined);
    this._globalState.update(KEY_MERMAID_LIBRARY_VERSION, undefined);
    this._eventEmitter.fire({ version: undefined, uri: undefined });
  }

  public get onDidChangeMermaidLibrary(): vscode.Event<
    MermaidLibraryChangeEvent
  > {
    return this._eventEmitter.event;
  }
}
