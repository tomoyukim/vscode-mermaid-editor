import * as vscode from 'vscode';
import isEmpty = require('lodash/isEmpty');
import * as constants from '../constants';
import VSCodeWrapper from '../VSCodeWrapper';

export interface CodeChange {
  code: string;
}

export default class CodeEditorView {
  private _vscodeWrapper: VSCodeWrapper;
  private _eventEmitter: vscode.EventEmitter<CodeChange>;

  private _code: string;

  constructor(code: string) {
    this._eventEmitter = new vscode.EventEmitter<CodeChange>();
    this._vscodeWrapper = new VSCodeWrapper();

    this._vscodeWrapper.onDidChangeTextDocument(editor => {
      this.onDidChangeTextDocument(editor);
    });
    this._vscodeWrapper.onDidChangeActiveTextEditor(editor => {
      this.onDidChangeActiveTextEditor(editor);
    });

    this._code = code;
    if (isEmpty(code)) {
      this._readCode();
    }
  }

  private _isMermaid(document: vscode.TextDocument | undefined): boolean {
    if (!document) {
      return false;
    }
    return document.languageId === constants.MERMAID_LANGUAGE_ID;
  }

  private _readCode(): void {
    const editor = this._vscodeWrapper.activeTextEditor;
    if (editor && this._isMermaid(editor.document)) {
      this._code = editor.document.getText().trim();
    }
  }

  public get code(): string {
    this._readCode();
    return this._code;
  }

  public get onDidChangeCode(): vscode.Event<CodeChange> {
    return this._eventEmitter.event;
  }

  // callbacks
  public async onDidChangeActiveTextEditor(
    editor: vscode.TextEditor | undefined
  ): Promise<void> {
    if (editor && this._isMermaid(editor.document)) {
      this._eventEmitter.fire({
        code: this.code
      });
    }
  }

  public async onDidChangeTextDocument(
    event: vscode.TextDocumentChangeEvent
  ): Promise<void> {
    if (this._isMermaid(event.document)) {
      this._eventEmitter.fire({
        code: this.code
      });
    }
  }
}
