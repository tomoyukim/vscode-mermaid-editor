import * as vscode from 'vscode';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as path from 'path';
import get = require('lodash/get');
import Logger from './Logger';

function getExtension(ext: string) {
  switch (ext) {
    case 'svg':
    case 'png':
    case 'pdf':
      return ext;
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

  public async generate(svg: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const uri = get(editor, 'document.uri', {});
    const workingDir = get(
      vscode.workspace.getWorkspaceFolder(uri),
      'uri.fsPath',
      '/' // XXX
    );

    this._statusBarItem.show();

    const userConfig = vscode.workspace.getConfiguration(
      'mermaid-editor.generate'
    );
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

    fs.writeFile(`${outputDirPath}/test.svg`, svg, e => {
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

  private _mmdc(editor: any, config: any, cwd: string) {
    const {
      theme,
      width,
      height,
      backgroundColor,
      format,
      outputDirPath
    } = config;

    const input = get(editor, 'document.fileName', '');

    const _intermediate = input.split('/');
    const _fileName = _intermediate[_intermediate.length - 1].split('.')[0];

    const output = `${outputDirPath}/${_fileName}.${getExtension(format)}`;
    const command = `${
      this._extensionPath
    }/node_modules/.bin/mmdc -t ${theme} -i ${input} -o ${output} -w ${width} -H ${height} -b ${backgroundColor}`;

    return this._execCommand(command, cwd);
  }

  private _execCommand(command: string, cwd: string) {
    Logger.instance().appendLine(command);

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
