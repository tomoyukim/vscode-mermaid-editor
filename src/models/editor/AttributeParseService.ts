class AttributeParseService {
  private parseAttribute(text: string, attr: string, regexp: RegExp): string {
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

  public parseConfig(text: string): string {
    return this.parseAttribute(text, '@config', /^\s*%%\s*@config\{(.*)\}.*$/);
  }

  public parseBackgroundColor(text: string): string {
    return this.parseAttribute(
      text,
      '@backgroundColor',
      /^\s*%%\s*@backgroundColor\{(.*)\}.*$/
    );
  }

  public parseOutputScale(text: string): string {
    return this.parseAttribute(
      text,
      '@outputScale',
      /^\s*%%\s*@outputScale\{(.*)\}.*$/
    );
  }
}

export default AttributeParseService;
