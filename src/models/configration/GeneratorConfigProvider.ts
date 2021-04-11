import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../../constants';

import ConfigurationProvider from './ConfigurationProvider';
import TextDocumentProvider from '../editor/TextDocumentProvider';
import FileSystemProvider from '../FileSystemService';

interface UseCurrentPath {
  kind: 'useCurrentPath';
  value: boolean;
}

interface OutputPath {
  kind: 'outputPath';
  value: string;
}

interface ImageConfig {
  kind: 'imageConfig';
  value: GeneratorImageConfig;
}

type GeneratorConfigType =
  | UseCurrentPath
  | OutputPath
  | ImageConfig
  | undefined;

export type GeneratorImageConfig = {
  type: string;
  scale: number;
};

export const GeneratorConfigProperty = {
  UseCurrentPath: 'useCurrentPath',
  OutputPath: 'outputPath',
  ImageConfig: 'imageConfig'
} as const;
export type GeneratorConfigProperty = typeof GeneratorConfigProperty[keyof typeof GeneratorConfigProperty];

class GeneratorConfigProvider {
  private _configurationProvider: ConfigurationProvider;
  private _textDocumentProvider: TextDocumentProvider;
  private _fileSystemProvider: FileSystemProvider;

  constructor(
    configurationProvider: ConfigurationProvider,
    textDocumentProvider: TextDocumentProvider,
    fileSystemService: FileSystemProvider
  ) {
    this._configurationProvider = configurationProvider;
    this._textDocumentProvider = textDocumentProvider;
    this._fileSystemProvider = fileSystemService;
  }

  private _getExtensionConfiguration(): vscode.WorkspaceConfiguration {
    return this._configurationProvider.getConfiguration(
      constants.CONFIG_SECTION_ME_GENERATE
    );
  }

  public _resolveOutputPath(outputPath = ''): string | undefined {
    const document = this._textDocumentProvider.activeTextDocument;
    if (!document) {
      return undefined;
    }

    const uri = document.uri;
    const workingDir = this._fileSystemProvider.getWorkspaceFolder(uri)?.uri
      .fsPath;
    if (workingDir) {
      if (outputPath) {
        return path.join(workingDir, outputPath);
      } else {
        return workingDir;
      }
    }
    return undefined;
  }

  public getConfig(key: GeneratorConfigProperty): GeneratorConfigType {
    const {
      useCurrentPath,
      outputPath,
      type,
      scale
    } = this._getExtensionConfiguration();
    switch (key) {
      case GeneratorConfigProperty.UseCurrentPath:
        return {
          kind: GeneratorConfigProperty.UseCurrentPath,
          value: !!useCurrentPath
        };
      case GeneratorConfigProperty.OutputPath:
        if (useCurrentPath) {
          return undefined;
        }
        const value = this._resolveOutputPath(outputPath);
        return !!value
          ? {
              kind: GeneratorConfigProperty.OutputPath,
              value
            }
          : undefined;
      case GeneratorConfigProperty.ImageConfig:
        const imageConfig = { type, scale };
        return {
          kind: GeneratorConfigProperty.ImageConfig,
          value: imageConfig
        };
      default:
        break;
    }
    // expected not to reach here
    throw new Error('The key is not existed');
  }

  // Note: onChange is not necessary for generator config so far
}

export default GeneratorConfigProvider;
