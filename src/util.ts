const MERMAID_LANGUAGE_ID = 'mermaid';

export function isMermaid(editor: any): boolean {
  if (!editor) {
    return false;
  }
  return editor.document.languageId === MERMAID_LANGUAGE_ID;
}
