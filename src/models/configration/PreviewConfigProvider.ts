import * as vscode from 'vscode';
import * as constants from '../../constants';

export interface ConfigurationProvider {
  getConfiguration(section: string): vscode.WorkspaceConfiguration;
  readonly onDidChangeConfiguration: vscode.Event<
    vscode.ConfigurationChangeEvent
  >;
}

export interface PreviewConfigChangeEvent {
  property: PreviewConfigProperty;
  config: string;
}

export const PreviewConfigProperty = {
  DefaultMermaidConfig: 'defaultMermaidConfig',
  BackgroundColor: 'backgroundColor'
} as const;
export type PreviewConfigProperty = typeof PreviewConfigProperty[keyof typeof PreviewConfigProperty];

class PreviewConfigProvider {
  private _configurationProvider: ConfigurationProvider;
  private _eventEmitter: vscode.EventEmitter<PreviewConfigChangeEvent>;

  private _pathToDefaultMermaidConfig: string;
  private _backgroundColor: string;

  constructor(configurationProvider: ConfigurationProvider) {
    this._configurationProvider = configurationProvider;

    this._pathToDefaultMermaidConfig = '';
    this._backgroundColor = '';

    this._eventEmitter = new vscode.EventEmitter<PreviewConfigChangeEvent>();
    this._configurationProvider.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        this.onDidChangeConfiguration(e);
      }
    );
  }

  private _getExtensionConfiguration(): vscode.WorkspaceConfiguration {
    return this._configurationProvider.getConfiguration(
      constants.CONFIG_SECTION_ME_PREVIEW
    );
  }

  private async _notifyUpdate(): Promise<void> {
    const {
      defaultMermaidConfig,
      backgroundColor
    } = this._getExtensionConfiguration();

    // defaultMermaidConfig
    if (this._pathToDefaultMermaidConfig !== defaultMermaidConfig) {
      this._pathToDefaultMermaidConfig = defaultMermaidConfig;
      this._eventEmitter.fire({
        property: PreviewConfigProperty.DefaultMermaidConfig,
        config: this._pathToDefaultMermaidConfig
      });
    }

    // backgroundColor
    if (this._backgroundColor !== backgroundColor) {
      this._backgroundColor = backgroundColor;
      this._eventEmitter.fire({
        property: PreviewConfigProperty.BackgroundColor,
        config: this._backgroundColor
      });
    }
  }

  public getConfig(key: PreviewConfigProperty): string {
    switch (key) {
      case PreviewConfigProperty.DefaultMermaidConfig:
        const { defaultMermaidConfig } = this._getExtensionConfiguration();
        return defaultMermaidConfig;
      case PreviewConfigProperty.BackgroundColor:
        const { backgroundColor } = this._getExtensionConfiguration();
        return backgroundColor;
      default:
        break;
    }
    // expected not to reach here
    throw new Error('The key is not existed.');
  }

  public get onDidChangePreviewConfig(): vscode.Event<
    PreviewConfigChangeEvent
  > {
    return this._eventEmitter.event;
  }

  // callbacks
  public async onDidChangeConfiguration(
    event: vscode.ConfigurationChangeEvent
  ): Promise<void> {
    if (event.affectsConfiguration(constants.CONFIG_SECTION_ME_PREVIEW)) {
      await this._notifyUpdate();
    }
  }
}

export default PreviewConfigProvider;
