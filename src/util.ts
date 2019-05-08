const MERMAID_LANGUAGE_ID = 'mermaid';

export function isMermaid(editor: any) {
  if (!editor) return false;
  return editor.document.languageId === MERMAID_LANGUAGE_ID;
}
