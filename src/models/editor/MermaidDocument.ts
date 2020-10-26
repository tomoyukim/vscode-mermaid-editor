import Code from './Code';

class MermaidDocument {
  private _code: Code;
  private _fileName: string;

  constructor(code = new Code(), fileName = '') {
    this._code = code;
    this._fileName = fileName;
  }

  public get code(): Code {
    return this._code;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public equal(document: MermaidDocument): boolean {
    return (
      document._code.value === this._code.value &&
      document._fileName === this._fileName
    );
  }
}

export default MermaidDocument;
