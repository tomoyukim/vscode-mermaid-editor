import * as assert from 'assert';

import createViewStateStore from '../../controllers/viewStateStore';
import {
  createChangeMermaidDocumentEvent,
  createChangePreviewConfigBackgroundColorEvent,
  createChangePreviewConfigDefaultMermaidConfigEvent
} from '../../controllers/viewStateStore';
import MermaidDocument from '../../models/editor/MermaidDocument';

suite('viewStateStore Tests', function() {
  const initialState = {
    mermaidDocument: new MermaidDocument(),
    defaultMermaidConfig: '/path/to/default/config',
    backgroundColor: '#000'
  };

  test('', () => {
    const store = createViewStateStore(initialState);
    assert.strictEqual(
      store.getState().mermaidDocument,
      initialState.mermaidDocument
    );
    assert.strictEqual(store.getState().backgroundColor, '#000');
    assert.strictEqual(
      store.getState().defaultMermaidConfig,
      '/path/to/default/config'
    );
  });

  test('should "mermaidDocument" is set and updated in store', done => {
    const store = createViewStateStore(initialState);
    const expectedMermaidDocument = new MermaidDocument(
      undefined,
      'another test file'
    );
    store.subscribe(() => {
      const state = store.getState();
      let error;
      try {
        assert.strictEqual(state.mermaidDocument, expectedMermaidDocument);
      } catch (e) {
        error = e;
      }
      done(error);
    });
    store.dispatch(createChangeMermaidDocumentEvent(expectedMermaidDocument));
  });

  test('should "backgroundColor" is set and updated in store', done => {
    const store = createViewStateStore(initialState);
    const expectedBackgroundColor = '#123';
    store.subscribe(() => {
      const state = store.getState();
      let error;
      try {
        assert.strictEqual(state.backgroundColor, expectedBackgroundColor);
      } catch (e) {
        error = e;
      }
      done(error);
    });
    store.dispatch(
      createChangePreviewConfigBackgroundColorEvent(expectedBackgroundColor)
    );
  });

  test('should "defaultMermaidConfig" is set and updated in store', done => {
    const store = createViewStateStore(initialState);
    const expectedDefaultMermaidConfig = '/path/to/config';
    store.subscribe(() => {
      const state = store.getState();
      let error;
      try {
        assert.strictEqual(
          state.defaultMermaidConfig,
          expectedDefaultMermaidConfig
        );
      } catch (e) {
        error = e;
      }
      done(error);
    });
    store.dispatch(
      createChangePreviewConfigDefaultMermaidConfigEvent(
        expectedDefaultMermaidConfig
      )
    );
  });
});
