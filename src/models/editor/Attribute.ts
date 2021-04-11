class Attribute {
  private _backgroundColor: string;
  private _pathToConfig: string;
  private _outputScale: string;

  constructor(backgroundColor = '', pathToConfig = '', outputScale = '') {
    this._backgroundColor = backgroundColor;
    this._pathToConfig = pathToConfig;
    this._outputScale = outputScale;
  }

  public get backgroundColor(): string {
    return this._backgroundColor;
  }

  public get pathToConfig(): string {
    return this._pathToConfig;
  }

  public get outputScale(): string {
    return this._outputScale;
  }
}

export default Attribute;
