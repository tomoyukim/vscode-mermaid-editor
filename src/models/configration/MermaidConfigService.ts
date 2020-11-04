import * as path from 'path';
import FileSystemService from '../FileSystemService';
import MermaidConfig from './MermaidConfig';

class MermaidConfigService {
  private _fileSystemService: FileSystemService;

  constructor(fileSystemService: FileSystemService) {
    this._fileSystemService = fileSystemService;
  }

  private _resolvePath(pathToFile: string): string | undefined {
    const workspaceFolders = this._fileSystemService.workspaceFolders;
    if (!workspaceFolders) {
      return undefined;
    }
    if (pathToFile[0] === '~') {
      if (process && process.env['HOME']) {
        return path.join(process.env['HOME'], pathToFile.slice(1));
      } else {
        throw new Error('"~" cannot be resolved in your environment.');
      }
    } else if (path.isAbsolute(pathToFile)) {
      return pathToFile;
    }
    return path.join(workspaceFolders[0].uri.fsPath, pathToFile);
  }

  public async getMermaidConfig(pathToConfig?: string): Promise<MermaidConfig> {
    let config, pathToDefaultConfig;
    if (pathToConfig) {
      try {
        pathToDefaultConfig = this._resolvePath(pathToConfig);
        if (pathToDefaultConfig) {
          const uri = this._fileSystemService.file(pathToDefaultConfig);
          config = await this._fileSystemService.readFile(uri);
        }
      } catch (error) {
        throw error;
      }
    }
    return new MermaidConfig(config, pathToDefaultConfig);
  }
}

export default MermaidConfigService;
