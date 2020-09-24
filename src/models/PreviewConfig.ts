import * as vscode from 'vscode';
import isEmpty = require('lodash/isEmpty');
import VSCodeWrapper from '../VSCodeWrapper';
import * as constants from '../constants';
import * as attributeParser from '../controllers/attributeParser';

export const PreviewConfigProperty = {
  BackgroundColor: 'BackgroundColor',
  Scale: 'Scale'
} as const;
export type PreviewConfigProperty = typeof PreviewConfigProperty[keyof typeof PreviewConfigProperty];

export interface PreviewConfigChangeEvent {
  property: PreviewConfigProperty;
  backgroundColor: string;
  scale: number;
}

export default class PreviewConfig {
  private _vscodeWrapper: VSCodeWrapper;
  private _eventEmitter: vscode.EventEmitter<PreviewConfigChangeEvent>;

  private _defaultBackgroundColor: string;
  private _backgroundColor: string;
  private _scale: number;

  constructor(code = '') {
    this._vscodeWrapper = new VSCodeWrapper();
    this._eventEmitter = new vscode.EventEmitter<PreviewConfigChangeEvent>();
    this._defaultBackgroundColor = this._getConfiguration().backgroundColor;
    this._backgroundColor = attributeParser.parseBackgroundColor(code);
    this._scale = constants.ZOOM_DEFAULT_SCALE;

    this._vscodeWrapper.onDidChangeConfiguration(() => {
      this.onDidChangeConfiguration();
    });
  }

  private _getConfiguration(): vscode.WorkspaceConfiguration {
    return this._vscodeWrapper.getConfiguration(
      constants.CONFIG_SECTION_ME_PREVIEW
    );
  }

  private _notifyUpdate(property: PreviewConfigProperty): void {
    this._eventEmitter.fire({
      property,
      backgroundColor: this.backgroundColor,
      scale: this.scale
    });
  }

  private _scaleInRange(value: number): boolean {
    if (value < constants.ZOOM_MIN_SCALE || constants.ZOOM_MAX_SCALE < value) {
      return false;
    }
    return true;
  }

  public get onDidChangePreviewConfig(): vscode.Event<
    PreviewConfigChangeEvent
  > {
    return this._eventEmitter.event;
  }

  public get backgroundColor(): string {
    return !isEmpty(this._backgroundColor)
      ? this._backgroundColor
      : this._defaultBackgroundColor;
  }

  public async updateBackgroundColor(code: string): Promise<void> {
    const prev = this._backgroundColor;
    this._backgroundColor = attributeParser.parseBackgroundColor(code);
    if (prev !== this.backgroundColor) {
      this._notifyUpdate(PreviewConfigProperty.BackgroundColor);
    }
  }

  public get scale(): number {
    return this._scale;
  }

  public set scale(value: number) {
    if (this._scaleInRange(value)) {
      const prev = this._scale;
      this._scale = value;
      if (prev !== this._scale) {
        this._notifyUpdate(PreviewConfigProperty.Scale);
      }
    }
  }

  // callbacks
  public async onDidChangeConfiguration(): Promise<void> {
    const prev = this._defaultBackgroundColor;
    this._defaultBackgroundColor = this._getConfiguration().backgroundColor;
    if (prev !== this.backgroundColor) {
      this._notifyUpdate(PreviewConfigProperty.BackgroundColor);
    }
  }
}
