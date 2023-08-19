import * as vscode from 'vscode';
import * as path from 'path';
import FileSystemService from '../models/FileSystemService';
import MermaidLibraryService, {
  MermaidLibraryChangeEvent
} from '../controllers/MermaidLibraryService';

const KEY_MERMAID_LIBRARY = 'mermaidLibrary';
const KEY_MERMAID_LIBRARY_VERSION = 'mermaidLibraryVersion';

export default class MermaidLibraryProvider implements MermaidLibraryService {
  private _eventEmitter: vscode.EventEmitter<MermaidLibraryChangeEvent>;

  private _extensionPath: string;
  private _globalState: vscode.Memento;
  private _fileSystemService: FileSystemService;
  private _whiteList: string[];

  constructor(
    extensionPath: string,
    globalState: vscode.Memento,
    fileSystemService: FileSystemService
  ) {
    this._eventEmitter = new vscode.EventEmitter<MermaidLibraryChangeEvent>();

    this._extensionPath = extensionPath;
    this._globalState = globalState;
    this._fileSystemService = fileSystemService;
    this._whiteList = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
  }

  private async _getIntegratedLibraryVersion(): Promise<string> {
    const binaryFile = this._fileSystemService.file(
      path.join(this._extensionPath, 'dist/vendor', 'mermaid/package.json')
    );
    const packageJson = await this._fileSystemService.readFile(binaryFile);
    const packageObj = JSON.parse(packageJson);
    return packageObj.version;
  }

  private _getIntegratedLibraryUri(): vscode.Uri {
    return this._fileSystemService.file(
      path.join(
        this._extensionPath,
        'dist/vendor',
        'mermaid/dist/mermaid.min.js'
      )
    );
  }

  public get libraryVersion(): Promise<string> {
    const libraryVersion = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY_VERSION
    );
    const libraryPath = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY
    );
    if (libraryVersion && libraryPath) {
      return Promise.resolve(libraryVersion);
    } else if (!libraryVersion && libraryPath) {
      return Promise.resolve('--(user value)');
    } else {
      return this._getIntegratedLibraryVersion();
    }
  }

  public get isIntegratedLibraryUsed(): boolean {
    const libraryPath = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY
    );
    return !libraryPath;
  }

  public get libraryUri(): vscode.Uri {
    const libraryPath = this._globalState.get<string | undefined>(
      KEY_MERMAID_LIBRARY
    );
    if (libraryPath) {
      return vscode.Uri.parse(libraryPath);
    } else {
      return this._getIntegratedLibraryUri();
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
