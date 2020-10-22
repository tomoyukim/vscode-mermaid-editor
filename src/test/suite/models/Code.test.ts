import * as assert from 'assert';
import Attribute from '../../../models/Attribute';
import Code from '../../../models/Code';

suite('Code Tests', function() {
  const dummyCode = `
  sequenceDiagram
  %% @config{./sample_config.json}
  %% @backgroundColor{#ff0000}
  Alice->>John: Hello
  Alice->>John: Bye
  `;

  test('should empty string or object in each property in case of not init properties', () => {
    const code = new Code();
    assert.strictEqual(code.value, '');
    assert.strictEqual(code.attribute.backgroundColor, '');
    assert.strictEqual(code.attribute.pathToConfig, '');
  });

  test('should return init properties', () => {
    const attribute = new Attribute('#fff', './path/to/config');
    const code = new Code(dummyCode, attribute);
    assert.strictEqual(code.value, dummyCode);
    assert.strictEqual(code.attribute, attribute);
  });
});
