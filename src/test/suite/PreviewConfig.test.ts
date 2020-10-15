import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance } from 'ts-mockito';

import VSCodeWrapper from '../../VSCodeWrapper';
import PreviewConfig from '../../models/PreviewConfig';
import * as constants from '../../constants';

suite('PreviewConfig Tests', function() {
  let mockedConfigurationChangeEvent: vscode.Event<vscode.ConfigurationChangeEvent>;

  suiteSetup(() => {
    mockedConfigurationChangeEvent = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener: (e: vscode.ConfigurationChangeEvent) => any
    ): vscode.Disposable => {
      return new vscode.Disposable(listener);
    };
  });

  test('should return backgroundColor from workspace configuration if no backgroundColor attribute', () => {
    const mockedConfiguration = mock<vscode.WorkspaceConfiguration>();
    when(mockedConfiguration.backgroundColor).thenReturn('#123');
    const stub = instance(mockedConfiguration);

    const mockedVSCWrapper = mock(VSCodeWrapper);
    when(
      mockedVSCWrapper.getConfiguration(constants.CONFIG_SECTION_ME_PREVIEW)
    ).thenReturn(stub);
    when(mockedVSCWrapper.onDidChangeConfiguration).thenReturn(
      mockedConfigurationChangeEvent
    );
    const vscodeWrapper = instance(mockedVSCWrapper);

    const previewConfig = new PreviewConfig('', vscodeWrapper);
    const color = previewConfig.backgroundColor;
    assert.strictEqual(color, '#123');
  });
});
