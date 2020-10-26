import Attribute from './Attribute';

class Code {
  private _value: string;
  private _attribute: Attribute;

  constructor(value = '', attribute = new Attribute()) {
    this._value = value;
    this._attribute = attribute;
  }

  public get value(): string {
    return this._value;
  }

  public get attribute(): Attribute {
    return this._attribute;
  }
}

export default Code;
