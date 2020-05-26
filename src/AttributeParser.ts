export default class AttributeParser {
  static parseConfig(text: string): string {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.indexOf('@config') > 0) {
        const candidates = line.match(/^\s*%%\s*@config\{(.*)\}.*$/);
        if (candidates && candidates[1]) {
          return candidates[1].trim();
        }
      }
    }
    return '';
  }
}
