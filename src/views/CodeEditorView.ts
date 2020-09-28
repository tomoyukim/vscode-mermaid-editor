import * as vscode from 'vscode';
import * as constants from '../constants';
import VSCodeWrapper from '../VSCodeWrapper';

export interface CodeChangeEvent {
  code: string;
  document: vscode.TextDocument;
}

export default class CodeEditorView {
  private _vscodeWrapper: VSCodeWrapper;
  private _eventEmitter: vscode.EventEmitter<CodeChangeEvent>;

  private _code: string;

  constructor() {
    this._eventEmitter = new vscode.EventEmitter<CodeChangeEvent>();
    this._vscodeWrapper = new VSCodeWrapper();

    this._vscodeWrapper.onDidChangeTextDocument(editor => {
      this.onDidChangeTextDocument(editor);
    });
    this._vscodeWrapper.onDidChangeActiveTextEditor(editor => {
      this.onDidChangeActiveTextEditor(editor);
    });

    this._code = '';
    this._readCode();
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

  private _notifyUpdate(document: vscode.TextDocument): void {
    const prev = this._code;
    if (prev !== this.code) {
      this._eventEmitter.fire({
        code: this._code,
        document
      });
    }
  }

  public get code(): string {
    this._readCode();
    return this._code;
  }

  public get document(): vscode.TextDocument | undefined {
    return this._vscodeWrapper.activeTextEditor?.document;
  }

  public get onDidChangeCode(): vscode.Event<CodeChangeEvent> {
    return this._eventEmitter.event;
  }

  // callbacks
  public async onDidChangeActiveTextEditor(
    editor: vscode.TextEditor | undefined
  ): Promise<void> {
    if (editor && this._isMermaid(editor.document)) {
      this._notifyUpdate(editor.document);
    }
  }

  public async onDidChangeTextDocument(
    event: vscode.TextDocumentChangeEvent
  ): Promise<void> {
    if (this._isMermaid(event.document)) {
      this._notifyUpdate(event.document);
    }
  }
}
