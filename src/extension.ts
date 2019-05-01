// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cp from "child_process";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "mermaid-editor" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.mermaidgen",
    () => {
      // The code you place here will be executed every time your command is executed
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      var filename = editor.document.uri.fsPath;
      vscode.window.showInformationMessage(editor.document.uri.toString());
      var workspaceFolder = vscode.workspace.getWorkspaceFolder(
        editor.document.uri
      );
      var cwd = workspaceFolder ? workspaceFolder.uri.fsPath : "/";
      vscode.window.showInformationMessage(cwd);

      var command = context.extensionPath + "/node_modules/.bin/mmdc -t forest";

      cp.exec(
        `${command} -i ${filename} -o sample.svg`,
        { cwd },
        (err, stdout, stderr) => {
          if (err) {
            vscode.window.showInformationMessage(stderr);
          }
          vscode.window.showInformationMessage(stdout);
        }
      );
      vscode.window.showInformationMessage("Hello World!");
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
