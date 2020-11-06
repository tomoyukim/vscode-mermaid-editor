import Code from './Code';

class MermaidDocument {
  private _code: Code;
  private _fileName: string;
  private _currentDir: string;

  constructor(code = new Code(), fileName = '', currentDir = '') {
    this._code = code;
    this._fileName = fileName;
    this._currentDir = currentDir;
  }

  public get code(): Code {
    return this._code;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get currentDir(): string {
    return this._currentDir;
  }

  public equal(document: MermaidDocument): boolean {
    return (
      document._code.value === this._code.value &&
      document._fileName === this._fileName
    );
  }
}

export default MermaidDocument;
