import { isEmpty } from 'lodash';
import { EndOfLine } from 'vscode';

type OnDeprecatedSyntax = () => void;
class AttributeParseService {
  private _onDeprecatedSyntax: OnDeprecatedSyntax | undefined; // TODO: remove at v1.0

  constructor(onDeprecatedSyntax?: OnDeprecatedSyntax) {
    this._onDeprecatedSyntax = onDeprecatedSyntax;
  }

  private parseAttribute(
    text: string,
    attr: string,
    regexp: RegExp,
    eol: EndOfLine
  ): string {
    const delimiter = eol === EndOfLine.LF ? '\n' : '\r\n';
    const lines = text.split(delimiter);
    for (const line of lines) {
      if (line.indexOf(attr) > 0) {
        const candidates = line.match(regexp);
        if (candidates && candidates[1]) {
          return candidates[1].trim();
        }
      }
    }
    return '';
  }

  public parseConfig(text: string, eol: EndOfLine = EndOfLine.LF): string {
    let attr = this.parseAttribute(
      text,
      '@config',
      /^\s*%%\s*@config\((.*)\).*$/,
      eol
    );
    if (isEmpty(attr)) {
      // TODO: remove at v1.0
      attr = this.parseAttribute(
        text,
        '@config',
        /^\s*%%\s*@config\{(.*)\}.*$/,
        eol
      );
      if (!isEmpty(attr)) {
        this._onDeprecatedSyntax?.();
      }
    }
    return attr;
  }

  public parseBackgroundColor(
    text: string,
    eol: EndOfLine = EndOfLine.LF
  ): string {
    let attr = this.parseAttribute(
      text,
      '@backgroundColor',
      /^\s*%%\s*@backgroundColor\((.*)\).*$/,
      eol
    );
    if (isEmpty(attr)) {
      // TODO: remove at v1.0
      attr = this.parseAttribute(
        text,
        '@backgroundColor',
        /^\s*%%\s*@backgroundColor\{(.*)\}.*$/,
        eol
      );
      if (!isEmpty(attr)) {
        this._onDeprecatedSyntax?.();
      }
    }
    return attr;
  }

  public parseOutputScale(text: string, eol: EndOfLine = EndOfLine.LF): string {
    let attr = this.parseAttribute(
      text,
      '@outputScale',
      /^\s*%%\s*@outputScale\((.*)\).*$/,
      eol
    );
    if (isEmpty(attr)) {
      // TODO: remove at v1.0
      attr = this.parseAttribute(
        text,
        '@outputScale',
        /^\s*%%\s*@outputScale\{(.*)\}.*$/,
        eol
      );
      if (!isEmpty(attr)) {
        this._onDeprecatedSyntax?.();
      }
    }
    return attr;
  }
}

export default AttributeParseService;
