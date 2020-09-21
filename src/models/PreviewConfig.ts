import * as vscode from 'vscode';
import isEmpty = require('lodash/isEmpty');
import VSCodeWrapper from '../VSCodeWrapper';
import * as constants from '../constants';
import * as attributeParser from '../controllers/attributeParser';

export interface PreviewConfigChange {
  backgroundColor: string;
}

export default class PreviewConfig {
  private _vscodeWrapper: VSCodeWrapper;
  private _eventEmitter: vscode.EventEmitter<PreviewConfigChange>;

  private _defaultBackgroundColor: string;
  private _backgroundColor: string;
  // TODO: scales

  constructor(code = '') {
    this._vscodeWrapper = new VSCodeWrapper();
    this._eventEmitter = new vscode.EventEmitter<PreviewConfigChange>();
    this._defaultBackgroundColor = this._getConfiguration().backgroundColor;
    this._backgroundColor = attributeParser.parseBackgroundColor(code);

    this._vscodeWrapper.onDidChangeConfiguration(() => {
      this.onDidChangeConfiguration();
    });
  }

  private _getConfiguration(): vscode.WorkspaceConfiguration {
    return this._vscodeWrapper.getConfiguration(
      constants.CONFIG_SECTION_ME_PREVIEW
    );
  }

  private _notifyUpdate(): void {
    this._eventEmitter.fire({
      backgroundColor: this.backgroundColor
    });
  }

  public get onDidChangePreviewConfig(): vscode.Event<PreviewConfigChange> {
    return this._eventEmitter.event;
  }

  public get backgroundColor(): string {
    return !isEmpty(this._backgroundColor)
      ? this._backgroundColor
      : this._defaultBackgroundColor;
  }

  public async updateConfig(code: string): Promise<void> {
    const prev = this._backgroundColor;
    this._backgroundColor = attributeParser.parseBackgroundColor(code);
    if (prev !== this.backgroundColor) {
      this._notifyUpdate();
    }
  }

  // callbacks
  public async onDidChangeConfiguration(): Promise<void> {
    const prev = this._defaultBackgroundColor;
    this._defaultBackgroundColor = this._getConfiguration().backgroundColor;
    if (prev !== this.backgroundColor) {
      this._notifyUpdate();
    }
  }
}
