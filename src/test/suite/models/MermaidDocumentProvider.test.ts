import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance } from 'ts-mockito';

import MermaidDocumentProvider from '../../../models/MermaidDocumentProvider';
import { TextDocumentProvider } from '../../../models/MermaidDocumentProvider';
import AttributeParseService from '../../../models/AttributeParseService';

suite('MermaidDocumentProvider Tests', function() {
  const dummyCode = `
  sequenceDiagram
  %% @config{./sample_config.json}
  %% @backgroundColor{#ff0000}
  Alice->>John: Hello
  Alice->>John: Bye
  `;

  //suiteSetup(() => {});

  test('should return current active MermaidDocument', () => {
    const mockedTextDocument = mock<vscode.TextDocument>();
    when(mockedTextDocument.getText()).thenReturn(dummyCode);
    when(mockedTextDocument.fileName).thenReturn('/path/to/file');
    when(mockedTextDocument.languageId).thenReturn('mermaid');

    const mockedTextDocumentProvider = mock<TextDocumentProvider>();
    when(mockedTextDocumentProvider.activeTextDocument).thenReturn(
      instance(mockedTextDocument)
    );

    const mockedAttributeParseService = mock(AttributeParseService);
    when(
      mockedAttributeParseService.parseBackgroundColor(dummyCode.trim())
    ).thenReturn('#fff');
    when(mockedAttributeParseService.parseConfig(dummyCode.trim())).thenReturn(
      './path/to/config'
    );

    const provider = new MermaidDocumentProvider(
      instance(mockedTextDocumentProvider),
      instance(mockedAttributeParseService)
    );

    const document = provider.document;
    assert.strictEqual(document.fileName, '/path/to/file');
    assert.strictEqual(document.code.value, dummyCode.trim());
    assert.strictEqual(document.code.attribute.backgroundColor, '#fff');
    assert.strictEqual(
      document.code.attribute.pathToConfig,
      './path/to/config'
    );
  });
});
