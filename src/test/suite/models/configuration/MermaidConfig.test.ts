import * as assert from 'assert';
import MermaidConfig from '../../../../models/configration/MermaidConfig';

suite('MermaidConfig Tests', function() {
  test('should empty string in each property in case of not init properties', () => {
    const config = new MermaidConfig();
    assert.strictEqual(config.value, JSON.stringify({}));
    assert.strictEqual(config.filePath, '');
  });

  test('should return init properties', () => {
    const testJson = JSON.stringify('{ "test": 1 }');
    const config = new MermaidConfig(testJson, '/path/to/file');
    assert.strictEqual(config.value, testJson);
    assert.strictEqual(config.filePath, '/path/to/file');
  });
});
