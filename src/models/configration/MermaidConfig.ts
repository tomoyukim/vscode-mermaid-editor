class MermaidConfig {
  private _value: string;
  private _filePath: string;

  constructor(value = JSON.stringify({}), filePath = '') {
    this._value = value;
    this._filePath = filePath;
  }

  public get value(): string {
    return this._value;
  }

  public get filePath(): string {
    return this._filePath;
  }
}

export default MermaidConfig;
