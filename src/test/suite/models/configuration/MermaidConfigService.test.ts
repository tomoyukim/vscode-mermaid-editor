import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import MermaidConfigService from '../../../../models/configration/MermaidConfigService';
import { mock, when, instance, anyString } from 'ts-mockito';
import FileSystemService from '../../../../models/FileSystemService';

suite('MermaidConfigService', () => {
  test('should return MermaidConfig with resolving relative path to config file', async () => {
    //
    const expectedAbsolutePath = '/absolute/path';
    const mockedUri = mock<vscode.Uri>();
    when(mockedUri.fsPath).thenReturn(expectedAbsolutePath);

    //
    const mockedWorkspaceFolder = mock<vscode.WorkspaceFolder>();
    when(mockedWorkspaceFolder.uri).thenReturn(instance(mockedUri));

    //
    const mockedFileSystemService = mock<FileSystemService>();
    when(mockedFileSystemService.workspaceFolders).thenReturn([
      instance(mockedWorkspaceFolder)
    ]);
    const dummyFileUri = mock<vscode.Uri>();
    const expectedPathToDefaultConfig = path.join(
      expectedAbsolutePath,
      '/path/to/config'
    );
    const expectedConfigString = '{"theme":"default"}';
    when(mockedFileSystemService.file(anyString())).thenReturn(
      instance(dummyFileUri)
    );
    when(mockedFileSystemService.readFile(instance(dummyFileUri))).thenResolve(
      expectedConfigString
    );

    //
    const service = new MermaidConfigService(instance(mockedFileSystemService));
    const result = await service.getMermaidConfig('./path/to/config');

    assert.strictEqual(result.value, expectedConfigString);
    assert.strictEqual(result.filePath, expectedPathToDefaultConfig);
  });

  test('should return MermaidConfig with resolving HOME path with path to config', async () => {
    if (!process || !process.env['HOME']) {
      // skip test case
      return;
    }

    //
    const expectedPathToDefaultConfig = path.join(
      process.env['HOME'],
      '/path/to/config'
    );

    //
    const mockedFileSystemService = mock<FileSystemService>();
    const dummyFileUri = mock<vscode.Uri>();
    const expectedConfigString = '{"theme":"default"}';
    when(mockedFileSystemService.file(expectedPathToDefaultConfig)).thenReturn(
      instance(dummyFileUri)
    );
    when(mockedFileSystemService.readFile(instance(dummyFileUri))).thenResolve(
      expectedConfigString
    );

    //
    const service = new MermaidConfigService(instance(mockedFileSystemService));
    const result = await service.getMermaidConfig('~/path/to/config');

    assert.strictEqual(result.value, expectedConfigString);
    assert.strictEqual(result.filePath, expectedPathToDefaultConfig);
  });

  test('should return MermaidConfig with resolving absolute path to config file', async () => {
    //
    const mockedFileSystemService = mock<FileSystemService>();
    const dummyFileUri = mock<vscode.Uri>();
    const expectedPathToDefaultConfig = '/absolute/path/path/to/config';
    const expectedConfigString = '{"theme":"default"}';
    when(mockedFileSystemService.file(expectedPathToDefaultConfig)).thenReturn(
      instance(dummyFileUri)
    );
    when(mockedFileSystemService.readFile(instance(dummyFileUri))).thenResolve(
      expectedConfigString
    );

    //
    const service = new MermaidConfigService(instance(mockedFileSystemService));
    const result = await service.getMermaidConfig(
      '/absolute/path/path/to/config'
    );

    assert.strictEqual(result.value, expectedConfigString);
    assert.strictEqual(result.filePath, expectedPathToDefaultConfig);
  });
});
