// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import get = require('lodash/get');
import PreviewPanel from './PreviewPanel';

const LOG_OUTPUT_CHANNEL = 'log:mermaid-editor';
let Log: vscode.OutputChannel;
let isRevived = false;

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

  // webview
  const getDiagram = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return '';

    return editor.document.getText();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('mermaid-editor.previewz', () => {
      PreviewPanel.createOrShow(context.extensionPath, getDiagram());
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    vscode.window.registerWebviewPanelSerializer(PreviewPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        isRevived = true;
        PreviewPanel.revive(webviewPanel, context.extensionPath, getDiagram());
      }
    });
  }

  // TODO: should be refactoring -> instance reference is broken!
  setTimeout(() => {
    // if previous webView is available when vscode restarts, prevend opening new webView
    if (!isRevived) {
      vscode.commands.executeCommand('mermaid-editor.preview');
    }
  }, 1000);

  const updatePreview = () => {
    PreviewPanel.currentPanel &&
      PreviewPanel.currentPanel.renderDiagram(getDiagram());
  };

  vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document === get(vscode, 'window.activeTextEditor', {}).document) {
      updatePreview();
    }
  });

  vscode.workspace.onDidChangeConfiguration(e => {
    updatePreview();
  });

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (e.textEditor === get(vscode, 'window.activeTextEditor', {})) {
      updatePreview();
    }
  });
}

export function deactivate() {
  Log && Log.dispose();
}
