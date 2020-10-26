class Attribute {
  private _backgroundColor: string;
  private _pathToConfig: string;

  constructor(backgroundColor = '', pathToConfig = '') {
    this._backgroundColor = backgroundColor;
    this._pathToConfig = pathToConfig;
  }

  public get backgroundColor(): string {
    return this._backgroundColor;
  }

  public get pathToConfig(): string {
    return this._pathToConfig;
  }
}

export default Attribute;
