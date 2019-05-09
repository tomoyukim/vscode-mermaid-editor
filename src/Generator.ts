import * as vscode from 'vscode';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as path from 'path';
import get = require('lodash/get');
import Logger from './Logger';

function getExtension(type: string) {
  switch (type) {
    case 'svg':
    case 'png':
      return type;
    default:
      return 'svg';
  }
}

export default class Generator {
  private readonly _extensionPath: string;
  private readonly _statusBarItem: vscode.StatusBarItem;

  public constructor(context: any) {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this._statusBarItem.text = '$(sync) generating image...';
    context.subscriptions.push(this._statusBarItem);

    this._extensionPath = context.extensionPath;
  }

  public static getConfiguration() {
    return vscode.workspace.getConfiguration('mermaid-editor.generate');
  }

  public async generate(data: string, type: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const uri = get(editor, 'document.uri', {});
    const workingDir = get(
      vscode.workspace.getWorkspaceFolder(uri),
      'uri.fsPath',
      '/' // XXX
    );

    this._statusBarItem.show();

    const userConfig = Generator.getConfiguration();
    const outputDirPath = userConfig.outputPath
      ? path.join(workingDir, userConfig.outputPath)
      : workingDir;

    const config = {
      ...userConfig,
      outputDirPath
    };

    try {
      await this._mkdir(outputDirPath, workingDir);
    } catch (e) {
      Logger.instance().appendLine(e.message);
      config.outputDirPath = this._extensionPath;
    }

    const input = get(editor, 'document.fileName', '');
    const _intermediate = input.split('/');
    const _fileName = _intermediate[_intermediate.length - 1].split('.')[0];
    const output = `${outputDirPath}/${_fileName}.${getExtension(type)}`;

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

  private _mkdir(outputPath: string, cwd: string) {
    return this._execCommand(`mkdir -p ${outputPath}`, cwd);
  }

  private _execCommand(command: string, cwd: string) {
    return new Promise((resolve, reject) => {
      cp.exec(command, { cwd }, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
