import * as vscode from 'vscode';
import * as path from 'path';
import FileSystemService from '../models/FileSystemService';

export interface MermaidLatestInformation {
  version: string;
  filename: string;
  latest: string;
}

export default class MermaidLibraryProvider {
  private _extensionPath: string;
  private _fileSystemService: FileSystemService;

  constructor(extensionPath: string, fileSystemService: FileSystemService) {
    this._extensionPath = extensionPath;
    this._fileSystemService = fileSystemService;
  }

  public async getIntegratedLibraryVersion(): Promise<string> {
    const binaryFile = this._fileSystemService.file(
      path.join(this._extensionPath, 'dist/vendor', 'mermaid/dist/package.json')
    );
    const packageJson = await this._fileSystemService.readFile(binaryFile);
    const packageObj = JSON.parse(packageJson);
    return packageObj.version;
  }

  public getIntegratedLibraryUri(): vscode.Uri {
    return this._fileSystemService.file(
      path.join(
        this._extensionPath,
        'dist/vendor',
        'mermaid/dist/mermaid.min.js'
      )
    );
  }
}
