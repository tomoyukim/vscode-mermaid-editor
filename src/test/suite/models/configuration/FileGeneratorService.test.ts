import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { mock, when, instance, reset, anyString, anything } from 'ts-mockito';

import FileGeneratorService from '../../../../models/FileGeneratorService';
import FileSystemService from '../../../../models/FileSystemService';
import { ImageFileType } from '../../../../models/FileGeneratorService';

suite('FileGeneratorService Tests', function() {
  let mocks: {
    fileSystemService: FileSystemService;
    reset(): void;
  };

  suiteSetup(() => {
    mocks = {
      fileSystemService: mock<FileSystemService>(),
      reset: (): void => {
        reset(mocks.fileSystemService);
      }
    };
  });

  test('should call FileSystemService#writeFile() with passed data with target path & file name correctly', done => {
    const expectedPathObj = path.parse('/path/to/diagram/dummy-diagram.jpg');
    let testUri: vscode.Uri;
    let failed = false;
    when(mocks.fileSystemService.file(anyString())).thenCall(
      (output: string) => {
        try {
          assert.strictEqual(
            output,
            path.join(expectedPathObj.dir, expectedPathObj.base)
          );
        } catch (e) {
          failed = true;
          done(e);
        }
        testUri = vscode.Uri.file(output);
        return testUri;
      }
    );

    const testData = '';
    const testBuffer = Buffer.from(testData, 'base64');
    when(mocks.fileSystemService.writeFile(anything(), anything())).thenCall(
      (uri: vscode.Uri, buffer: Buffer) => {
        if (failed) {
          return;
        }
        try {
          assert.strictEqual(uri, testUri);
          assert.strictEqual(buffer.equals(testBuffer), true);
          done();
        } catch (e) {
          done(e);
        }
      }
    );

    const fileGeneratorService = new FileGeneratorService(
      instance(mocks.fileSystemService)
    );

    fileGeneratorService.outputFile(
      testData,
      expectedPathObj.dir,
      expectedPathObj.name,
      ImageFileType.JPG
    );
    mocks.reset();
  });

  test('should catch FileSystemService#writeFile() error at the caller', done => {
    when(mocks.fileSystemService.file(anyString())).thenCall(
      (output: string) => {
        return vscode.Uri.file(output);
      }
    );

    const testError = new Error('test error object');
    when(mocks.fileSystemService.writeFile(anything(), anything())).thenCall(
      () => {
        throw testError;
      }
    );

    const fileGeneratorService = new FileGeneratorService(
      instance(mocks.fileSystemService)
    );

    fileGeneratorService
      .outputFile('', '/path/to/diagram', 'dummy-diagram', ImageFileType.WEBP)
      .catch(e => {
        try {
          assert.strictEqual(e, testError);
          done();
        } catch (e) {
          done(e);
        }
      });
    mocks.reset();
  });
});
