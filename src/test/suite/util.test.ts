import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

import { isMermaid } from '../../util';

suite('util Tests', function() {
  let fixturePath: string;

  suiteSetup(() => {
    fixturePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'test',
      'fixtures'
    );
  });

  test('isMermaid should return false when document is undefined', () => {
    assert.equal(isMermaid(undefined), false);
  });

  test('isMermaid should return true when mmd text is opened', async () => {
    const uri = vscode.Uri.file(path.join(fixturePath, 'sequence.mmd'));
    const textDocument = await vscode.workspace.openTextDocument(uri);
    assert.equal(isMermaid(textDocument), true);
  });

  test('isMermaid should return false when text file other than mmd is opened', async () => {
    const uri = vscode.Uri.file(path.join(fixturePath, 'test.txt'));
    const textDocument = await vscode.workspace.openTextDocument(uri);
    assert.equal(isMermaid(textDocument), false);
  });
});
