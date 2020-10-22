import * as vscode from 'vscode';
import * as constants from '../constants';
import Attribute from './Attribute';
import Code from './Code';
import AttributeParseService from './AttributeParseService';
import MermaidDocument from './MermaidDocument';

export interface MermaidDocumentChangeEvent {
  mermaidDocument: MermaidDocument;
}

export interface TextDocumentChangeEvent {
  document: vscode.TextDocument;
}

export interface TextDocumentProvider {
  readonly activeTextDocument: vscode.TextDocument | undefined;
  readonly onDidChangeTextDocument: vscode.Event<TextDocumentChangeEvent>;
  readonly onDidChangeActiveTextEditor: vscode.Event<
    vscode.TextEditor | undefined
  >;
}

class MermaidDocumentProvider {
  private _textDocumentProvider: TextDocumentProvider;
  private _eventEmitter: vscode.EventEmitter<MermaidDocumentChangeEvent>;
  private _attributeParseService: AttributeParseService;

  private _mermaidDocument: MermaidDocument;

  constructor(
    textDocumentProvider: TextDocumentProvider,
    attributeParseService: AttributeParseService
  ) {
    this._eventEmitter = new vscode.EventEmitter<MermaidDocumentChangeEvent>();
    this._textDocumentProvider = textDocumentProvider;
    this._attributeParseService = attributeParseService;

    this._mermaidDocument = new MermaidDocument(); // empty

    this._textDocumentProvider.onDidChangeTextDocument(event => {
      this.onDidChangeTextDocument(event.document);
    });
    this._textDocumentProvider.onDidChangeActiveTextEditor(editor => {
      this.onDidChangeActiveTextEditor(editor?.document);
    });
  }

  private _isMermaid(document: vscode.TextDocument | undefined): boolean {
    if (!document) {
      return false;
    }
    return document.languageId === constants.MERMAID_LANGUAGE_ID;
  }

  private _createMermaidDocument(
    document: vscode.TextDocument
  ): MermaidDocument {
    const fileName = document.fileName;
    const code = document.getText().trim();

    const attribute = new Attribute(
      this._attributeParseService.parseBackgroundColor(code),
      this._attributeParseService.parseConfig(code)
    );
    return new MermaidDocument(new Code(code, attribute), fileName);
  }

  private _notifyUpdate(document: vscode.TextDocument): void {
    if (document && this._isMermaid(document)) {
      const prev = this._mermaidDocument;
      this._mermaidDocument = this._createMermaidDocument(document);
      if (!prev || !this._mermaidDocument.equal(prev)) {
        this._eventEmitter.fire({
          mermaidDocument: this._mermaidDocument
        });
      }
    }
  }

  public get document(): MermaidDocument {
    const document = this._textDocumentProvider.activeTextDocument;
    if (document && this._isMermaid(document)) {
      this._mermaidDocument = this._createMermaidDocument(document);
    }
    return this._mermaidDocument;
  }

  public get onDidChangeMermaidDocument(): vscode.Event<
    MermaidDocumentChangeEvent
  > {
    return this._eventEmitter.event;
  }

  // callbacks
  public async onDidChangeTextDocument(
    document: vscode.TextDocument
  ): Promise<void> {
    this._isMermaid(document) && this._notifyUpdate(document);
  }

  public async onDidChangeActiveTextEditor(
    document: vscode.TextDocument | undefined
  ): Promise<void> {
    document && this._isMermaid(document) && this._notifyUpdate(document);
  }
}

export default MermaidDocumentProvider;
