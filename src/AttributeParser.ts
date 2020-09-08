export default class AttributeParser {
  private static _parseAttribute(
    text: string,
    attr: string,
    regexp: RegExp
  ): string {
    const lines = text.split('\n');
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

  static parseConfig(text: string): string {
    return this._parseAttribute(text, '@config', /^\s*%%\s*@config\{(.*)\}.*$/);
  }

  static parseBackgroundColor(text: string): string {
    return this._parseAttribute(
      text,
      '@backgroundColor',
      /^\s*%%\s*@backgroundColor\{(.*)\}.*$/
    );
  }
}
