import { EndOfLine } from 'vscode';

class AttributeParseService {
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
    return this.parseAttribute(
      text,
      '@config',
      /^\s*%%\s*@config\{(.*)\}.*$/,
      eol
    );
  }

  public parseBackgroundColor(
    text: string,
    eol: EndOfLine = EndOfLine.LF
  ): string {
    return this.parseAttribute(
      text,
      '@backgroundColor',
      /^\s*%%\s*@backgroundColor\{(.*)\}.*$/,
      eol
    );
  }

  public parseOutputScale(text: string, eol: EndOfLine = EndOfLine.LF): string {
    return this.parseAttribute(
      text,
      '@outputScale',
      /^\s*%%\s*@outputScale\{(.*)\}.*$/,
      eol
    );
  }
}

export default AttributeParseService;
