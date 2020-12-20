import * as assert from 'assert';
import { mock, when, instance, anyFunction } from 'ts-mockito';

import { Store } from 'redux';
import Renderer, { RendererError } from '../../../view/Renderer';

interface TestParams {
  property: string;
}

interface TestAction {
  type: 'test/action';
  payload: string;
}

type TestState = {
  state: string;
};

type UpdateViewCallback = (params: TestParams) => void;
type RenderCallback = (params: TestParams) => void;
type NotifyErrorCallback = (error: RendererError) => void;

class TestView extends Renderer<TestParams, TestState, TestAction> {
  private _callbackUpdateView: UpdateViewCallback | undefined;
  private _callbackRender: RenderCallback | undefined;
  private _callbackNotifyError: NotifyErrorCallback | undefined;

  protected updateView(params: TestParams): void {
    this._callbackUpdateView && this._callbackUpdateView(params);
  }
  protected render(params: TestParams): void {
    this._callbackRender && this._callbackRender(params);
  }
  protected notifyError(error: RendererError): void {
    this._callbackNotifyError && this._callbackNotifyError(error);
  }

  public onCallUpdateView(callback: UpdateViewCallback): void {
    this._callbackUpdateView = callback;
  }

  public onCallRender(callback: RenderCallback): void {
    this._callbackRender = callback;
  }

  public onCallNotifyError(callback: NotifyErrorCallback): void {
    this._callbackNotifyError = callback;
  }
}

suite('Renderer Test', () => {
  test('should call notifyError when "bind" is never called appropriately', done => {
    const testView = new TestView();
    testView.onCallNotifyError((error: RendererError) => {
      let err;
      try {
        assert.strictEqual(error.kind, 'error/renderer');
        if (error.kind === 'error/renderer') {
          assert.strictEqual(
            error.message,
            '[Renderer::init] store or selector not binded'
          );
        }
      } catch (e) {
        err = e;
      }
      done(err);
    });
    testView.init();
  });

  test('should call render when "init" is called', done => {
    const testView = new TestView();
    testView.onCallRender((params: TestParams) => {
      let err;
      try {
        assert.strictEqual(params.property, 'mocked state:selected');
      } catch (e) {
        err = e;
      }
      done(err);
    });

    const mockedStore = mock<Store<TestState, TestAction>>();
    when(mockedStore.getState()).thenReturn({ state: 'mocked state' });

    testView.bind(instance(mockedStore), async (state: TestState) => {
      return { property: state.state + ':selected' };
    });
    testView.init();
  });

  test('should call updateView when stateStore is updated', done => {
    let callSubscriber: (() => void) | undefined;
    const mockedStore = mock<Store<TestState, TestAction>>();
    when(mockedStore.subscribe(anyFunction())).thenCall(
      (callback: () => void) => {
        callSubscriber = callback;
      }
    );
    when(mockedStore.getState()).thenReturn({ state: 'mocked state' });

    const testView = new TestView();
    testView.onCallUpdateView((params: TestParams) => {
      let err;
      try {
        assert.strictEqual(params.property, 'mocked state:selected');
      } catch (e) {
        err = e;
      }
      done(err);
    });
    testView.bind(instance(mockedStore), async (state: TestState) => {
      return { property: state.state + ':selected' };
    });
    testView.timeout = 20;

    if (callSubscriber === undefined) {
      assert.fail('subscribe is not expectedly called');
    } else {
      callSubscriber();
    }
  });

  test('should call updateView once with latest state when stateStore is updated multipletimes in short period', done => {
    let callSubscriber: (() => void) | undefined;
    const mockedStore = mock<Store<TestState, TestAction>>();
    when(mockedStore.subscribe(anyFunction())).thenCall(
      (callback: () => void) => {
        callSubscriber = callback;
      }
    );
    when(mockedStore.getState())
      .thenReturn({ state: 'mocked 1st state' })
      .thenReturn({ state: 'mocked 2nd state' });

    const testView = new TestView();
    testView.onCallUpdateView((params: TestParams) => {
      let err;
      try {
        assert.strictEqual(params.property, 'mocked 2nd state:selected');
      } catch (e) {
        err = e;
      }
      done(err);
    });
    testView.bind(instance(mockedStore), async (state: TestState) => {
      return { property: state.state + ':selected' };
    });
    testView.timeout = 20;

    if (callSubscriber === undefined) {
      assert.fail('subscribe is not expectedly called');
    } else {
      callSubscriber();
      callSubscriber();
    }
  });
});
