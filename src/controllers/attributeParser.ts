function parseAttribute(text: string, attr: string, regexp: RegExp): string {
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

export function parseConfig(text: string): string {
  return parseAttribute(text, '@config', /^\s*%%\s*@config\{(.*)\}.*$/);
}

export function parseBackgroundColor(text: string): string {
  return parseAttribute(
    text,
    '@backgroundColor',
    /^\s*%%\s*@backgroundColor\{(.*)\}.*$/
  );
}
