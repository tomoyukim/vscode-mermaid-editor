// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import get = require('lodash/get');

const LOG_OUTPUT_CHANNEL = 'log:mermaid-editor';
let Log: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  if (!Log) {
    Log = vscode.window.createOutputChannel(LOG_OUTPUT_CHANNEL);
  }

  let disposable = vscode.commands.registerCommand(
    'mermaid-editor.generate',
    () => {
      const config = vscode.workspace.getConfiguration('mermaid-editor');
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const getExtension = (ext: string) => {
        switch (ext) {
          case 'svg':
          case 'png':
          case 'pdf':
            return ext;
          default:
            return 'svg';
        }
      };

      const {
        theme,
        width,
        height,
        backgroundColor,
        format,
        outputPath
      } = config;
      const input = get(editor, 'document.fileName', '');
      const output = `${input.split('.')[0]}.${getExtension(format)}`;
      const command = `${
        context.extensionPath
      }/node_modules/.bin/mmdc -t ${theme} -i ${input} -o ${output} -w ${width} -H ${height} -b ${backgroundColor}`;

      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
      );
      statusBarItem.text = '$(sync) mmdc: generating...';
      statusBarItem.tooltip = `Output to ${output}`;
      context.subscriptions.push(statusBarItem);

      const uri = get(editor, 'document.uri', {});
      const cwd = get(
        vscode.workspace.getWorkspaceFolder(uri),
        'uri.fsPath',
        '/'
      );
      Log.appendLine(cwd);
      cp.exec(command, { cwd }, (err, stdout, stderr) => {
        if (err) {
          Log.appendLine(err.message);
          vscode.window.showErrorMessage(err.message);
        } else {
          vscode.window.showInformationMessage(`mermaid-editor: generated!`);
        }
        statusBarItem.hide();
        Log.show();
      });
      statusBarItem.show();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  Log && Log.dispose();
}
