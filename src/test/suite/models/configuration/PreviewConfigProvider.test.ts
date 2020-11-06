import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance, reset } from 'ts-mockito';
import * as constants from '../../../../constants';

import PreviewConfigProvider, {
  PreviewConfigProperty
} from '../../../../models/configration/PreviewConfigProvider';
import ConfigurationProvider from '../../../../models/configration/ConfigurationProvider';

suite('PreviewConfigProvider Tests', function() {
  let mocks: {
    configuration: vscode.WorkspaceConfiguration;
    configurationProvider: ConfigurationProvider;
    reset(): void;
  };

  suiteSetup(() => {
    mocks = {
      configuration: mock<vscode.WorkspaceConfiguration>(),
      configurationProvider: mock<ConfigurationProvider>(),
      reset: (): void => {
        reset(mocks.configuration);
        reset(mocks.configurationProvider);
      }
    };
  });

  test('should return mermaid-editor.preview scoped config in extension config', () => {
    when(mocks.configuration.backgroundColor).thenReturn('#123');
    when(mocks.configuration.defaultMermaidConfig).thenReturn(
      '/path/to/config'
    );

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_PREVIEW
      )
    ).thenReturn(instance(mocks.configuration));

    const previewConfigProvider = new PreviewConfigProvider(
      instance(mocks.configurationProvider)
    );

    assert.strictEqual(
      previewConfigProvider.getConfig(PreviewConfigProperty.BackgroundColor),
      '#123'
    );
    assert.strictEqual(
      previewConfigProvider.getConfig(
        PreviewConfigProperty.DefaultMermaidConfig
      ),
      '/path/to/config'
    );

    mocks.reset();
  });

  test('should call onChangePreviewConfig when backgroundColor is changed', done => {
    // Note: initial provider without calling 'getConfig" has empty properties
    // So, the onChangePreviewConfig is called when extension config is edited before calling 'getConfig'

    when(mocks.configuration.backgroundColor).thenReturn('#123');
    when(mocks.configuration.defaultMermaidConfig).thenReturn(
      '/path/to/config'
    );

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_PREVIEW
      )
    ).thenReturn(instance(mocks.configuration));

    const previewConfigProvider = new PreviewConfigProvider(
      instance(mocks.configurationProvider)
    );

    const expects = [
      {
        property: PreviewConfigProperty.DefaultMermaidConfig,
        config: '/path/to/config'
      },
      {
        property: PreviewConfigProperty.BackgroundColor,
        config: '#123'
      }
    ];
    let count = 0;
    previewConfigProvider.onDidChangePreviewConfig(event => {
      assert.strictEqual(event.property, expects[count].property);
      assert.strictEqual(event.config, expects[count].config);
      count++;
      if (count === 2) {
        done();
      }
    });

    const mockedEvent = mock<vscode.ConfigurationChangeEvent>();
    when(
      mockedEvent.affectsConfiguration(constants.CONFIG_SECTION_ME_PREVIEW)
    ).thenReturn(true);
    previewConfigProvider.onDidChangeConfiguration(instance(mockedEvent));

    mocks.reset();
  });
});
