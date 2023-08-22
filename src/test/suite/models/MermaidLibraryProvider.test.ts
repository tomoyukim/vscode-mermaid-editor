import * as assert from 'assert';
import * as vscode from 'vscode';
import { mock, when, instance, reset, anything, anyString } from 'ts-mockito';

import FileSystemProvider from '../../../models/FileSystemService';
import MermaidLibraryProvider, {
  KEY_MERMAID_LIBRARY,
  KEY_MERMAID_LIBRARY_VERSION
} from '../../../models/MermaidLibraryProvider';

suite('MermaidLibraryProvider Tests', function() {
  let mocks: {
    globalState: vscode.Memento;
    fileSystemProvider: FileSystemProvider;
    reset(): void;
  };

  suiteSetup(() => {
    mocks = {
      globalState: mock<vscode.Memento>(),
      fileSystemProvider: mock<FileSystemProvider>(),
      reset: (): void => {
        reset(mocks.globalState);
        reset(mocks.fileSystemProvider);
      }
    };
  });

  // libraryVersion
  test('should return stored library version', async () => {
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY_VERSION)).thenReturn(
      '10.3.1'
    );
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(
      'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.3.1/mermaid.min.js'
    );

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const version = await mermaidLibraryProvider.libraryVersion;

    assert.strictEqual(version, '10.3.1');

    mocks.reset();
  });

  test('should return fixed text instead of version', async () => {
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY_VERSION)).thenReturn(
      undefined
    );
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(
      'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'
    );

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const version = await mermaidLibraryProvider.libraryVersion;

    assert.strictEqual(version, '--(user value)');

    mocks.reset();
  });

  test('should return integrated mermaid library version', async () => {
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY_VERSION)).thenReturn(
      undefined
    );
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(undefined);

    let fileInstance, filePath;
    const dummyFilePath = '/home/extension/dist/vendor/mermaid/package.json';
    const dummyFile = vscode.Uri.file(`file://${dummyFilePath}`);
    when(mocks.fileSystemProvider.file(anything())).thenCall(path => {
      filePath = path;
      return dummyFile;
    });
    when(mocks.fileSystemProvider.readFile(anything())).thenCall(file => {
      fileInstance = file;
      return '{"version":"9.4.0"}';
    });

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const version = await mermaidLibraryProvider.libraryVersion;

    assert.strictEqual(filePath, dummyFilePath);
    assert.strictEqual(fileInstance, dummyFile);
    assert.strictEqual(version, '9.4.0');

    mocks.reset();
  });

  // libraryUri
  test('should return stored library uri', () => {
    const dummyUri =
      'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.3.1/mermaid.min.js';
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(dummyUri);

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const uri = mermaidLibraryProvider.libraryUri;

    assert.strictEqual(uri.toString(), dummyUri);

    mocks.reset();
  });

  test('should return integrated mermaid library uri', () => {
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(undefined);

    let filePath;
    const dummyFilePath =
      '/home/extension/dist/vendor/mermaid/dist/mermaid.min.js';
    const dummyFile = vscode.Uri.file(dummyFilePath);
    when(mocks.fileSystemProvider.file(anything())).thenCall(path => {
      filePath = path;
      return dummyFile;
    });

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const uri = mermaidLibraryProvider.libraryUri;

    assert.strictEqual(filePath, dummyFilePath);
    assert.strictEqual(uri.toString(), dummyFile.toString());

    mocks.reset();
  });

  // isIntegratedLibraryUsed
  test('should return false when integrated library is NOT used', () => {
    const dummyUri =
      'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.3.1/mermaid.min.js';
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(dummyUri);

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const result = mermaidLibraryProvider.isIntegratedLibraryUsed;

    assert.strictEqual(result, false);

    mocks.reset();
  });

  test('should return true when integrated library is used', () => {
    when(mocks.globalState.get(KEY_MERMAID_LIBRARY)).thenReturn(undefined);

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    const result = mermaidLibraryProvider.isIntegratedLibraryUsed;

    assert.strictEqual(result, true);

    mocks.reset();
  });

  // setLibrary, onDidChangeMermaidLibrary
  test('should set library path and version', done => {
    const dummyUri =
      'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.3.1/mermaid.min.js';
    const dummyVersion = '10.3.0';

    let libraryUri = 'uri not called';
    let libraryVersion = 'version not called';
    when(mocks.globalState.update(anyString(), anything())).thenCall(
      (key, value) => {
        switch (key) {
          case KEY_MERMAID_LIBRARY:
            libraryUri = value;
            break;
          case KEY_MERMAID_LIBRARY_VERSION:
            libraryVersion = value;
            break;
        }
      }
    );

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    mermaidLibraryProvider.onDidChangeMermaidLibrary(({ version, uri }) => {
      let error;
      try {
        assert.strictEqual(version, dummyVersion);
        assert.strictEqual(uri?.toString(), dummyUri);
        // check mock
        assert.strictEqual(libraryVersion, dummyVersion);
        assert.strictEqual(libraryUri, dummyUri);
      } catch (e) {
        error = e;
      }
      done(error);
      mocks.reset();
    });

    mermaidLibraryProvider.setLibrary(dummyUri, dummyVersion);
  });

  test('should set library path only', done => {
    const dummyUri = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';

    let libraryUri = 'uri not called';
    let libraryVersion = 'version not called';
    when(mocks.globalState.update(anyString(), anything())).thenCall(
      (key, value) => {
        switch (key) {
          case KEY_MERMAID_LIBRARY:
            libraryUri = value;
            break;
          case KEY_MERMAID_LIBRARY_VERSION:
            libraryVersion = value;
            break;
        }
      }
    );

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    mermaidLibraryProvider.onDidChangeMermaidLibrary(({ version, uri }) => {
      let error;
      try {
        assert.strictEqual(version, undefined);
        assert.strictEqual(uri?.toString(), dummyUri);
        // check mock
        assert.strictEqual(libraryVersion, undefined);
        assert.strictEqual(libraryUri, dummyUri);
      } catch (e) {
        error = e;
      }
      mocks.reset();
      done(error);
    });

    mermaidLibraryProvider.setLibrary(dummyUri);
  });

  test('should NOT set URI excluding whitelists', () => {
    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );
    mermaidLibraryProvider.onDidChangeMermaidLibrary(() => {
      assert.fail('shold not reach to onDidChangeMermaidLibrary');
    });

    let message = 'setLibrary do not throw Error unexpectedly';

    // another authority
    let dummyUri = 'https://www.google.com';
    try {
      mermaidLibraryProvider.setLibrary(dummyUri);
    } catch (e) {
      if (e instanceof Error) {
        message = e.message;
      }
    }
    assert.strictEqual(message, `${dummyUri} is not supported.`);

    // another scheme
    dummyUri = 'ftp://cdn.jsdelivr.net/hoge/script.js';
    try {
      mermaidLibraryProvider.setLibrary(dummyUri);
    } catch (e) {
      if (e instanceof Error) {
        message = e.message;
      }
    }
    assert.strictEqual(message, `${dummyUri} is not supported.`);

    mocks.reset();
  });

  // resetLibrary, onDidChangeMermaidLibrary
  test('should reset library path and version', done => {
    const dummyFilePath =
      '/home/extension/dist/vendor/mermaid/dist/mermaid.min.js';
    const dummyVersion = '9.4.0';
    when(mocks.fileSystemProvider.file(anything())).thenReturn(
      vscode.Uri.file(dummyFilePath)
    );
    when(mocks.fileSystemProvider.readFile(anything())).thenResolve(
      `{"version":"${dummyVersion}"}`
    );
    when(mocks.globalState.get(anyString(), anything())).thenReturn(undefined);

    let libraryUri = 'uri not called';
    let libraryVersion = 'version not called';
    when(mocks.globalState.update(anyString(), anything())).thenCall(
      (key, value) => {
        switch (key) {
          case KEY_MERMAID_LIBRARY:
            libraryUri = value;
            break;
          case KEY_MERMAID_LIBRARY_VERSION:
            libraryVersion = value;
            break;
        }
      }
    );

    const mermaidLibraryProvider = new MermaidLibraryProvider(
      '/home/extension',
      instance(mocks.globalState),
      instance(mocks.fileSystemProvider)
    );

    mermaidLibraryProvider.onDidChangeMermaidLibrary(({ version, uri }) => {
      let error;
      try {
        assert.strictEqual(version, dummyVersion);
        assert.strictEqual(uri?.toString(), `file://${dummyFilePath}`);
        // check mock
        assert.strictEqual(libraryVersion, undefined);
        assert.strictEqual(libraryUri, undefined);
      } catch (e) {
        error = e;
      }
      done(error);
      mocks.reset();
    });

    mermaidLibraryProvider.resetLibrary();
  });
});
