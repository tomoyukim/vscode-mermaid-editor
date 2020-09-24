import * as vscode from 'vscode';
import * as path from 'path';
import isEmpty = require('lodash/isEmpty');
import * as process from 'process';
import { TextDecoder } from 'util';
import VSCodeWrapper from '../VSCodeWrapper';
import * as constants from '../constants';
import * as attributeParser from '../controllers/attributeParser';
import Logger from '../Logger';

export interface MermaidConfigChangeEvent {
  config: string;
}

export default class MermaidConfig {
  private _vscodeWrapper: VSCodeWrapper;
  private _eventEmitter: vscode.EventEmitter<MermaidConfigChangeEvent>;

  private _defaultMermaidConfig: string;
  private _mermaidConfig: string;

  constructor() {
    this._vscodeWrapper = new VSCodeWrapper();
    this._eventEmitter = new vscode.EventEmitter<MermaidConfigChangeEvent>();
    const { theme } = this._getConfiguration();
    this._defaultMermaidConfig = JSON.stringify({
      theme
    });
    this._mermaidConfig = '';

    this._vscodeWrapper.onDidChangeConfiguration(() => {
      this.onDidChangeConfiguration();
    });
  }

  public async init(
    document: vscode.TextDocument | undefined,
    code: string
  ): Promise<void> {
    this._defaultMermaidConfig = await this._readDefaultConfig();
    if (document) {
      this._mermaidConfig = await this._readMermaidConfig(document, code);
    }
  }

  private async _readFile(uri: vscode.Uri): Promise<string> {
    const config = await vscode.workspace.fs.readFile(uri);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(config);
  }

  private _getConfiguration(): vscode.WorkspaceConfiguration {
    return this._vscodeWrapper.getConfiguration(
      constants.CONFIG_SECTION_ME_PREVIEW
    );
  }

  private async _readDefaultConfig(): Promise<string> {
    const { defaultMermaidConfig, theme } = this._getConfiguration();
    const workspaceFolders = this._vscodeWrapper.workspaceFolders;
    let config = JSON.stringify({
      theme
    });
    if (defaultMermaidConfig && workspaceFolders) {
      const _resolvePath = (filePath: string): string => {
        if (filePath[0] === '~') {
          if (process && process.env['HOME']) {
            return path.join(process.env['HOME'], filePath.slice(1));
          } else {
            throw new Error('"~" cannot be resolved in your environment.');
          }
        } else if (path.isAbsolute(filePath)) {
          return filePath;
        }
        return path.join(workspaceFolders[0].uri.fsPath, filePath);
      };
      try {
        const pathToDefaultConfig = _resolvePath(defaultMermaidConfig);
        const uri = vscode.Uri.file(pathToDefaultConfig);
        config = await this._readFile(uri);
      } catch (error) {
        const logger = new Logger();
        logger.outputError(error.message);
      }
    }
    return config;
  }

  private async _readMermaidConfig(
    document: vscode.TextDocument,
    code: string
  ): Promise<string> {
    let config = '';
    const pathToConfig = attributeParser.parseConfig(code);
    if (!isEmpty(pathToConfig) && document) {
      const uri = vscode.Uri.file(
        path.join(path.dirname(document.fileName), pathToConfig)
      );
      config = await this._readFile(uri);
    }
    return config;
  }

  public get onDidChangeMermaidConfig(): vscode.Event<MermaidConfigChangeEvent> {
    return this._eventEmitter.event;
  }

  public get config(): string {
    return !isEmpty(this._mermaidConfig)
      ? this._mermaidConfig
      : this._defaultMermaidConfig;
  }

  public async updateConfig(
    document: vscode.TextDocument,
    code: string
  ): Promise<void> {
    const prev = this.config;
    this._mermaidConfig = await this._readMermaidConfig(document, code);
    if (prev !== this.config) {
      this._eventEmitter.fire({
        config: this.config
      });
    }
  }

  // callbacks
  public async onDidChangeConfiguration(): Promise<void> {
    const prev = this.config;
    this._defaultMermaidConfig = await this._readDefaultConfig();
    if (prev !== this.config) {
      this._eventEmitter.fire({
        config: this.config
      });
    }
  }
}
