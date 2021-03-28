import * as assert from 'assert';

import Timer from '../../utils/Timer';

suite('Timer Tests', function() {
  test('should execute task after specified milliseconds', done => {
    const timer = new Timer<void>();
    timer.lazyExec(async () => {
      assert.ok('passed');
      done();
    }, 20);
  });

  test('should not execute task when it is cancelled', done => {
    const timer = new Timer<void>();
    timer.lazyExec(async () => {
      try {
        assert.fail('should not reach out here.');
      } catch (e) {
        done(e);
      }
    }, 20);
    setTimeout(() => {
      assert.ok('passed');
      done();
    }, 50);
    timer.cancel();
  });

  test('should execute task with cancelling previous task', done => {
    const timer = new Timer<void>();
    timer.lazyExec(async () => {
      try {
        assert.fail('should not reach out here.');
      } catch (e) {
        done(e);
      }
    }, 20);
    timer.cancel();

    timer.lazyExec(async () => {
      assert.ok('passed');
      done();
    }, 50);
  });
});
