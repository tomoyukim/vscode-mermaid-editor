import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance, reset, anything } from 'ts-mockito';
import * as constants from '../../../../constants';

import GeneratorConfigProvider, {
  GeneratorConfigProperty
} from '../../../../models/configration/GeneratorConfigProvider';
import ConfigurationProvider from '../../../../models/configration/ConfigurationProvider';
import TextDocumentProvider from '../../../../models/editor/TextDocumentProvider';
import FileSystemProvider from '../../../../models/FileSystemService';

suite('GeneratorConfigProvider Tests', function() {
  let mocks: {
    configuration: vscode.WorkspaceConfiguration;
    configurationProvider: ConfigurationProvider;
    textDocumentProvider: TextDocumentProvider;
    fileSystemProvider: FileSystemProvider;
    reset(): void;
  };

  suiteSetup(() => {
    mocks = {
      configuration: mock<vscode.WorkspaceConfiguration>(),
      configurationProvider: mock<ConfigurationProvider>(),
      textDocumentProvider: mock<TextDocumentProvider>(),
      fileSystemProvider: mock<FileSystemProvider>(),
      reset: (): void => {
        reset(mocks.configuration);
        reset(mocks.configurationProvider);
        reset(mocks.textDocumentProvider);
        reset(mocks.fileSystemProvider);
      }
    };
  });

  test('should return workspaceFolder path when mermaid-editor.generator.outputPath is null', () => {
    when(mocks.configuration.outputPath).thenReturn(null);
    when(mocks.configuration.useCurrentPath).thenReturn(false);

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const mockedWorkspaceFolder = mock<vscode.WorkspaceFolder>();
    const mockedUri = mock(vscode.Uri);
    when(mockedUri.fsPath).thenReturn('dummy workspace folder');
    when(mockedWorkspaceFolder.uri).thenReturn(instance(mockedUri));
    when(mocks.fileSystemProvider.getWorkspaceFolder(anything())).thenReturn(
      instance(mockedWorkspaceFolder)
    );

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    const config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    if (!config) {
      assert.fail('config should not be undefined');
    }
    assert.strictEqual(config.kind, 'outputPath');
    assert.strictEqual(config.value, 'dummy workspace folder');

    mocks.reset();
  });

  test('should return mermaid-editor.generator in extension config', () => {
    when(mocks.configuration.useCurrentPath).thenReturn(true);
    when(mocks.configuration.type).thenReturn('jpg');
    when(mocks.configuration.width).thenReturn('800');
    when(mocks.configuration.height).thenReturn('600');

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    const imageConfig = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.ImageConfig
    );
    if (imageConfig === undefined) {
      assert.fail('ImageConfig is unexpectedly undefined');
    }
    if (imageConfig.kind !== GeneratorConfigProperty.ImageConfig) {
      assert.fail('ImageConfig is unexpectedly not GeneratorImageConfig type');
    }

    assert.strictEqual(imageConfig.value.type, 'jpg');
    assert.strictEqual(imageConfig.value.width, '800');
    assert.strictEqual(imageConfig.value.height, '600');

    let config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.UseCurrentPath
    );
    if (config === undefined) {
      assert.fail('config is unexpectedly undefined');
    }
    assert.strictEqual(config.value, true);

    config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    assert.strictEqual(config, undefined);

    mocks.reset();
  });

  test('should return undefined when mermaid-editor.generator.useCurrentPath is true', () => {
    when(mocks.configuration.outputPath).thenReturn('/path/to/img/output');
    when(mocks.configuration.useCurrentPath).thenReturn(true);

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    let config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.UseCurrentPath
    );
    assert.strictEqual(config?.value, true);
    config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    assert.strictEqual(
      generatorConfigProvider.getConfig(GeneratorConfigProperty.OutputPath),
      undefined
    );

    mocks.reset();
  });

  test('should return mermaid-editor.generator.outputPath in extension config', () => {
    const mockedDocument = mock<vscode.TextDocument>();
    const dummyUri = vscode.Uri.file('/dummy/uri');
    when(mockedDocument.uri).thenReturn(dummyUri);
    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(
      instance(mockedDocument)
    );

    const mockedWorkspaceFolder = mock<vscode.WorkspaceFolder>();
    when(mockedWorkspaceFolder.uri).thenReturn(
      vscode.Uri.file('/path/to/workingDir')
    );
    when(mocks.fileSystemProvider.getWorkspaceFolder(dummyUri)).thenReturn(
      instance(mockedWorkspaceFolder)
    );

    when(mocks.configuration.outputPath).thenReturn('/path/to/img/output');
    when(mocks.configuration.useCurrentPath).thenReturn(false);

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    let config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.UseCurrentPath
    );
    assert.strictEqual(config?.value, false);
    config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    assert.strictEqual(config?.value, '/path/to/workingDir/path/to/img/output');

    mocks.reset();
  });

  test('should return undefined when WorkspaceFolder is undefined', () => {
    const mockedDocument = mock<vscode.TextDocument>();
    const dummyUri = vscode.Uri.file('/dummy/uri');
    when(mockedDocument.uri).thenReturn(dummyUri);
    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(
      instance(mockedDocument)
    );

    when(mocks.fileSystemProvider.getWorkspaceFolder(dummyUri)).thenReturn(
      undefined
    );

    when(mocks.configuration.outputPath).thenReturn('/path/to/img/output');
    when(mocks.configuration.useCurrentPath).thenReturn(false);

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    let config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.UseCurrentPath
    );
    assert.strictEqual(config?.value, false);
    config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    assert.strictEqual(config?.value, undefined);

    mocks.reset();
  });

  test('should return mermaid-editor.generator.outputPath in extension config', () => {
    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(undefined);

    when(mocks.configuration.outputPath).thenReturn('/path/to/img/output');
    when(mocks.configuration.useCurrentPath).thenReturn(false);

    when(
      mocks.configurationProvider.getConfiguration(
        constants.CONFIG_SECTION_ME_GENERATE
      )
    ).thenReturn(instance(mocks.configuration));

    const generatorConfigProvider = new GeneratorConfigProvider(
      instance(mocks.configurationProvider),
      instance(mocks.textDocumentProvider),
      instance(mocks.fileSystemProvider)
    );

    let config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.UseCurrentPath
    );
    assert.strictEqual(config?.value, false);
    config = generatorConfigProvider.getConfig(
      GeneratorConfigProperty.OutputPath
    );
    assert.strictEqual(config?.value, undefined);

    mocks.reset();
  });
});
