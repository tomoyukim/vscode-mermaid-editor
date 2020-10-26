import * as assert from 'assert';
import Attribute from '../../../../models/editor/Attribute';
import Code from '../../../../models/editor/Code';
import MermaidDocument from '../../../../models/editor/MermaidDocument';

suite('MermaidDocument Tests', function() {
  const dummyCode = `
  sequenceDiagram
  %% @config{./sample_config.json}
  %% @backgroundColor{#ff0000}
  Alice->>John: Hello
  Alice->>John: Bye
  `;

  test('should empty string or object in each property in case of not init properties', () => {
    const document = new MermaidDocument();
    assert.strictEqual(document.fileName, '');
    assert.strictEqual(document.code.value, '');
    assert.strictEqual(document.code.attribute.backgroundColor, '');
    assert.strictEqual(document.code.attribute.pathToConfig, '');
  });

  test('should return init properties', () => {
    const attribute = new Attribute('#fff', './path/to/config');
    const code = new Code(dummyCode, attribute);
    const document = new MermaidDocument(code, '/path/to/file');
    assert.strictEqual(document.fileName, '/path/to/file');
    assert.strictEqual(document.code.value, dummyCode);
    assert.strictEqual(document.code.attribute.backgroundColor, '#fff');
    assert.strictEqual(
      document.code.attribute.pathToConfig,
      './path/to/config'
    );
  });
});
