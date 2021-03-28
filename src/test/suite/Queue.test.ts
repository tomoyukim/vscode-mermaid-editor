import * as assert from 'assert';

import Queue from '../../utils/Queue';

suite('Queue Tests', function() {
  test('should enqueue and dequeue in expected order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);
    assert.strictEqual(queue.size(), 4);
    assert.strictEqual(queue.dequeue(), 1);
    assert.strictEqual(queue.dequeue(), 2);
    assert.strictEqual(queue.dequeue(), 3);
    assert.strictEqual(queue.dequeue(), 4);
  });

  test('should clear queue', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);
    assert.strictEqual(queue.size(), 4);
    assert.strictEqual(queue.dequeue(), 1);
    assert.strictEqual(queue.dequeue(), 2);
    queue.clear();
    assert.strictEqual(queue.size(), 0);
    assert.strictEqual(queue.peek(), undefined);
    assert.strictEqual(queue.dequeue(), undefined);
  });

  test('should peek queue', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);
    assert.strictEqual(queue.size(), 4);
    assert.strictEqual(queue.peek(), 1);
    assert.strictEqual(queue.dequeue(), 1);
    assert.strictEqual(queue.peek(), 2);
    assert.strictEqual(queue.dequeue(), 2);
    queue.clear();
    assert.strictEqual(queue.size(), 0);
    assert.strictEqual(queue.peek(), undefined);
    assert.strictEqual(queue.dequeue(), undefined);
  });
});
