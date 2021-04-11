import * as assert from 'assert';
import Attribute from '../../../../models/editor/Attribute';

suite('Attribute Tests', function() {
  test('should empty string in each property in case of not init properties', () => {
    const attribute = new Attribute();
    assert.strictEqual(attribute.backgroundColor, '');
    assert.strictEqual(attribute.pathToConfig, '');
    assert.strictEqual(attribute.outputScale, '');
  });

  test('should return init properties', () => {
    const attribute = new Attribute('#fff', './path/to/config', '2.0');
    assert.strictEqual(attribute.backgroundColor, '#fff');
    assert.strictEqual(attribute.pathToConfig, './path/to/config');
    assert.strictEqual(attribute.outputScale, '2.0');
  });
});
