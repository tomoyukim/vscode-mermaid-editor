import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import mkdirp = require('mkdirp');
import get = require('lodash/get');
import Logger from './Logger';

function getExtension(type: string): string {
  switch (type) {
    case 'svg':
    case 'png':
    case 'jpg':
    case 'webp':
      return type;
    default:
      return 'svg';
  }
}

export default class Generator {
  private readonly _extensionPath: string;
  private readonly _statusBarItem: vscode.StatusBarItem;

  public constructor(context: vscode.ExtensionContext) {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this._statusBarItem.text = '$(sync) generating image...';
    context.subscriptions.push(this._statusBarItem);

    this._extensionPath = context.extensionPath;
  }

  public static getConfiguration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('mermaid-editor.generate');
  }

  public async generate(data: string, type: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const input = get(editor, 'document.fileName', '');
    const uri = get(editor, 'document.uri', {});
    const currentDir = path.dirname(input);
    const workingDir = get(
      vscode.workspace.getWorkspaceFolder(uri),
      'uri.fsPath',
      currentDir
    );

    this._statusBarItem.show();

    const userConfig = Generator.getConfiguration();
    const _getOutputPath = (): string => {
      if (userConfig.useCurrentPath) {
        return currentDir;
      }
      return userConfig.outputPath
        ? path.join(workingDir, userConfig.outputPath)
        : workingDir;
    };
    const outputDirPath = _getOutputPath();

    const config = {
      ...userConfig,
      outputDirPath
    };

    try {
      await mkdirp(outputDirPath);
    } catch (e) {
      Logger.instance().appendLine(e.message);
      config.outputDirPath = this._extensionPath;
    }

    const _fileName = `${path.basename(input, '.mmd')}.${getExtension(type)}`;
    const output = path.join(outputDirPath, _fileName);

    fs.writeFile(output, data, 'base64', e => {
      if (e) {
        Logger.instance().appendLine(e.message);
        vscode.window.showErrorMessage(e.message);
      } else {
        vscode.window.showInformationMessage(`mermaid-editor: generated!`);
      }
      this._statusBarItem.hide();
      Logger.instance().show();
    });
  }
}
