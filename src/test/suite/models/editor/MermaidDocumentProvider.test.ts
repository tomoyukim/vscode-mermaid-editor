import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance, anyFunction, verify, reset } from 'ts-mockito';

import MermaidDocumentProvider from '../../../../models/editor/MermaidDocumentProvider';
import { TextDocumentProvider } from '../../../../models/editor/MermaidDocumentProvider';
import AttributeParseService from '../../../../models/editor/AttributeParseService';
import { domainToUnicode } from 'url';

suite('MermaidDocumentProvider Tests', function() {
  const dummyCode = `
  sequenceDiagram
  %% @config{./sample_config.json}
  %% @backgroundColor{#ff0000}
  Alice->>John: Hello
  Alice->>John: Bye
  `;

  const anotherDummyCode = `
  graph TD
  A[Hard] -->|Text| B(Round)
  B --> C{Decision}
  C -->|One| D[Result 1]
  C -->|Two| E[Result 2]
  `;

  let mocks: {
    textDocument: vscode.TextDocument;
    textDocumentProvider: TextDocumentProvider;
    attributeParseService: AttributeParseService;
    reset(): void;
  };

  suiteSetup(() => {
    mocks = {
      textDocument: mock<vscode.TextDocument>(),
      textDocumentProvider: mock<TextDocumentProvider>(),
      attributeParseService: mock(AttributeParseService),
      reset: (): void => {
        reset(mocks.textDocument);
        reset(mocks.textDocumentProvider);
        reset(mocks.attributeParseService);
      }
    };
  });

  test('should return empty MermaodDocument when active document is not .mmd file', () => {
    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(
      instance(mocks.textDocument)
    );
    const provider = new MermaidDocumentProvider(
      instance(mocks.textDocumentProvider),
      instance(mocks.attributeParseService)
    );

    const document = provider.document;
    assert.strictEqual(document.fileName, '');
    assert.strictEqual(document.code.value, '');
    assert.strictEqual(document.code.attribute.backgroundColor, '');
    assert.strictEqual(document.code.attribute.pathToConfig, '');

    mocks.reset();
  });

  test('should return current active MermaidDocument', () => {
    when(mocks.textDocument.getText()).thenReturn(dummyCode);
    when(mocks.textDocument.fileName).thenReturn('/path/to/file');
    when(mocks.textDocument.languageId).thenReturn('mermaid');

    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(
      instance(mocks.textDocument)
    );

    when(
      mocks.attributeParseService.parseBackgroundColor(dummyCode.trim())
    ).thenReturn('#fff');
    when(mocks.attributeParseService.parseConfig(dummyCode.trim())).thenReturn(
      './path/to/config'
    );

    const provider = new MermaidDocumentProvider(
      instance(mocks.textDocumentProvider),
      instance(mocks.attributeParseService)
    );

    const document = provider.document;
    assert.strictEqual(document.fileName, '/path/to/file');
    assert.strictEqual(document.code.value, dummyCode.trim());
    assert.strictEqual(document.code.attribute.backgroundColor, '#fff');
    assert.strictEqual(
      document.code.attribute.pathToConfig,
      './path/to/config'
    );

    mocks.reset();
  });

  test('should not call onDidChangeMermaidDocument when the content in TextDocument is not changed', done => {
    when(mocks.textDocument.getText()).thenReturn(dummyCode);
    when(mocks.textDocument.fileName).thenReturn('/path/to/file');
    when(mocks.textDocument.languageId).thenReturn('mermaid');

    when(mocks.textDocumentProvider.activeTextDocument).thenReturn(
      instance(mocks.textDocument)
    );

    when(
      mocks.attributeParseService.parseBackgroundColor(dummyCode.trim())
    ).thenReturn('#fff');
    when(mocks.attributeParseService.parseConfig(dummyCode.trim())).thenReturn(
      './path/to/config'
    );

    const provider = new MermaidDocumentProvider(
      instance(mocks.textDocumentProvider),
      instance(mocks.attributeParseService)
    );

    provider.onDidChangeMermaidDocument(() => {
      done(new Error('onDidChangeMermaidDocument should not be called.'));
    });

    try {
      verify(
        mocks.textDocumentProvider.onDidChangeTextDocument(anyFunction())
      ).once();
      verify(
        mocks.textDocumentProvider.onDidChangeActiveTextEditor(anyFunction())
      ).once();
    } catch (e) {
      done(e);
      return;
    }

    setTimeout(done, 10);
    provider.document; // read active TextDocument
    provider.onDidChangeTextDocument(instance(mocks.textDocument));

    // not reset to keep mock state for next test
  });

  test('should call onDidChangeMermaidDocument when onDidChangeTextDocument is occurred', done => {
    const updatedDummyCode = dummyCode + 'hey';
    when(
      mocks.attributeParseService.parseBackgroundColor(updatedDummyCode.trim())
    ).thenReturn('#111');
    when(
      mocks.attributeParseService.parseConfig(updatedDummyCode.trim())
    ).thenReturn('./path/to/config.json');

    const provider = new MermaidDocumentProvider(
      instance(mocks.textDocumentProvider),
      instance(mocks.attributeParseService)
    );

    provider.onDidChangeMermaidDocument(e => {
      let error;
      try {
        assert.strictEqual(e.mermaidDocument.fileName, '/path/to/file');
        assert.strictEqual(
          e.mermaidDocument.code.value,
          updatedDummyCode.trim()
        );
        assert.strictEqual(
          e.mermaidDocument.code.attribute.backgroundColor,
          '#111'
        );
        assert.strictEqual(
          e.mermaidDocument.code.attribute.pathToConfig,
          './path/to/config.json'
        );
      } catch (e) {
        error = e;
      }
      done(error);
    });

    const mockedTextDocument2 = mock<vscode.TextDocument>();
    when(mockedTextDocument2.getText()).thenReturn(updatedDummyCode);
    when(mockedTextDocument2.fileName).thenReturn('/path/to/file');
    when(mockedTextDocument2.languageId).thenReturn('mermaid');

    provider.onDidChangeTextDocument(instance(mockedTextDocument2));

    // not reset to keep mock state for next test
  });

  test('should call onDidChangeMermaidDocument when onDidChangeActiveTextEditor is occurred ', done => {
    when(
      mocks.attributeParseService.parseBackgroundColor(anotherDummyCode.trim())
    ).thenReturn('white');
    when(
      mocks.attributeParseService.parseConfig(anotherDummyCode.trim())
    ).thenReturn('./path/to/config3.json');

    const provider = new MermaidDocumentProvider(
      instance(mocks.textDocumentProvider),
      instance(mocks.attributeParseService)
    );

    provider.onDidChangeMermaidDocument(e => {
      let error;
      try {
        assert.strictEqual(e.mermaidDocument.fileName, '/path/to/file3');
        assert.strictEqual(
          e.mermaidDocument.code.value,
          anotherDummyCode.trim()
        );
        assert.strictEqual(
          e.mermaidDocument.code.attribute.backgroundColor,
          'white'
        );
        assert.strictEqual(
          e.mermaidDocument.code.attribute.pathToConfig,
          './path/to/config3.json'
        );
      } catch (e) {
        error = e;
      }
      done(error);
    });

    const mockedTextDocument3 = mock<vscode.TextDocument>();
    when(mockedTextDocument3.getText()).thenReturn(anotherDummyCode);
    when(mockedTextDocument3.fileName).thenReturn('/path/to/file3');
    when(mockedTextDocument3.languageId).thenReturn('mermaid');

    provider.onDidChangeTextDocument(instance(mockedTextDocument3));

    mocks.reset();
  });
});
