import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  mock,
  when,
  instance,
  anyFunction,
  anything,
  anyString
} from 'ts-mockito';
import * as constants from '../../../constants';
import FileSystemService from '../../../models/FileSystemService';
import DiagramWebView from '../../../view/DiagramWebView';
import {
  CaptureImageEndEvent,
  ErrorEvent
} from '../../../view/DiagramWebViewTypes';
import { ImageFileType } from '../../../models/FileGeneratorService';

suite('DiagramWebView Tests', function() {
  test('should construct DiagramWebView', done => {
    const mockedFileSystemService = mock<FileSystemService>();

    let didReceiveMessageCnt = 0;
    const webView = mock<vscode.Webview>();
    when(webView.onDidReceiveMessage(anyFunction())).thenCall(() => {
      didReceiveMessageCnt++;
    });

    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));
    when(webViewPanel.onDidChangeViewState(anyFunction())).thenCall(() => {
      if (didReceiveMessageCnt === 1) {
        done();
      } else {
        done(new Error('onDidReceiveMessage is not called.'));
      }
    });

    new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
  });

  test('should return active/visible property', () => {
    const mockedFileSystemService = mock<FileSystemService>();

    const webView = mock<vscode.Webview>();
    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));
    when(webViewPanel.active).thenReturn(true);
    when(webViewPanel.visible).thenReturn(true);

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
    assert.strictEqual(diagramWebView.active, true);
    assert.strictEqual(diagramWebView.visible, true);
  });

  test('should call postMessage with "zoomTo" command and appropriate scale value', done => {
    const mockedFileSystemService = mock<FileSystemService>();

    let cnt = 0;
    const webView = mock<vscode.Webview>();
    when(webView.postMessage(anything())).thenCall((message: any) => {
      try {
        assert.strictEqual(message.command, 'zoomTo');
        cnt++;
        switch (cnt) {
          case 1:
            assert.strictEqual(message.value, 1.2);
            break;
          case 2:
            assert.strictEqual(message.value, 1.3);
            break;
          case 3:
            assert.strictEqual(message.value, 1.2);
            break;
          case 4:
          case 5:
            assert.strictEqual(message.value, constants.ZOOM_MAX_SCALE);
            break;
          case 6:
          case 7:
            assert.strictEqual(message.value, constants.ZOOM_MIN_SCALE);
            break;
          case 8:
            assert.strictEqual(message.value, constants.ZOOM_DEFAULT_SCALE);
            done();
            break;
        }
      } catch (e) {
        done(e);
      }
    });

    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
    diagramWebView.zoomTo(1.2);
    diagramWebView.zoomIn();
    diagramWebView.zoomOut();
    diagramWebView.zoomTo(3.0);
    diagramWebView.zoomIn();
    diagramWebView.zoomTo(0.1);
    diagramWebView.zoomOut();
    diagramWebView.zoomReset();
  });

  test('should call postMessage with "update" command and appropriate params', done => {
    const mockedFileSystemService = mock<FileSystemService>();

    const webView = mock<vscode.Webview>();
    when(webView.postMessage(anything())).thenCall((message: any) => {
      try {
        assert.strictEqual(message.command, 'update');
        assert.strictEqual(message.code, 'code');
        assert.strictEqual(message.configuration, 'mermaid-config');
        assert.strictEqual(message.backgroundColor, 'background-color');
        done();
      } catch (e) {
        done(e);
      }
    });

    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
    diagramWebView.updateView({
      code: 'code',
      mermaidConfig: 'mermaid-config',
      backgroundColor: 'background-color'
    });
  });

  test('should call postMessage with "takeImage" command and appropriate params', done => {
    const mockedFileSystemService = mock<FileSystemService>();

    const webView = mock<vscode.Webview>();
    when(webView.postMessage(anything())).thenCall((message: any) => {
      try {
        assert.strictEqual(message.command, 'takeImage');
        assert.strictEqual(message.type, 'png');
        assert.strictEqual(message.scale, 1);
        done();
      } catch (e) {
        done(e);
      }
    });

    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
    diagramWebView.captureImage({
      type: ImageFileType.PNG,
      scale: 1
    });
  });

  test('should call "reviel" of WebViewPanel with appropriate params', done => {
    const mockedFileSystemService = mock<FileSystemService>();

    const webView = mock<vscode.Webview>();
    const webViewPanel = mock<vscode.WebviewPanel>();
    when(webViewPanel.webview).thenReturn(instance(webView));
    when(webViewPanel.reveal(anything(), anything())).thenCall(
      (viewColumn?: vscode.ViewColumn, preserveFocus?: boolean) => {
        try {
          assert.strictEqual(viewColumn, vscode.ViewColumn.Beside);
          assert.strictEqual(preserveFocus, false);
          done();
        } catch (e) {
          done(e);
        }
      }
    );

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(webViewPanel)
    );
    diagramWebView.reviel();
  });

  test('should "render" generate appropriate html with passed properties', done => {
    const expectedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mermaid Editor Preview</title>
      <link rel="stylesheet" href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css">
      <style>
      body {
        background-color: deep-blue;
      }
      </style>
    </head>
    <body>
      <div id="preview" class="mermaid">
      Lorem Ipsum
      </div>
      <script src="file:///path/extension/dist/vendor/mermaid/dist/mermaid.min.js"></script>
      <script>mermaid.initialize({"test":"config","startOnLoad":true});</script>
      <script src="file:///path/extension/media/main.js"></script>
    </body>
    </html>`;

    let fileToBeCalled = false;
    const mockedFileSystemService = mock<FileSystemService>();
    when(mockedFileSystemService.file(anyString())).thenCall((path: string) => {
      fileToBeCalled = true;
      return vscode.Uri.file(path);
    });

    const mockedWebView = mock<vscode.Webview>();
    when(mockedWebView.asWebviewUri(anything())).thenCall((uri: vscode.Uri) => {
      try {
        if (
          uri.path !== '/path/extension/media/main.js' &&
          uri.path !== '/path/extension/dist/vendor/mermaid/dist/mermaid.min.js'
        ) {
          throw new Error('asWebviewUri is called with unexpected Uri object');
        }
      } catch (e) {
        done(e);
      }
      return uri;
    });
    const webView = instance(mockedWebView);

    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(webView);

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.render({
      code: 'Lorem Ipsum',
      mermaidConfig: '{ "test": "config" }',
      backgroundColor: 'deep-blue'
    });

    assert.strictEqual(fileToBeCalled, true, '"file" is not called');
    assert.strictEqual(webView.html, expectedHtml);
    done();
  });

  test('should "render" invokes onDidError when passed config is invalid format', done => {
    const expectedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mermaid Editor Preview</title>
      <link rel="stylesheet" href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css">
      <style>
      body {
        background-color: deep-blue;
      }
      </style>
    </head>
    <body>
      <div id="preview" class="mermaid">
      Lorem Ipsum
      </div>
      <script src="file:///path/extension/dist/vendor/mermaid/dist/mermaid.min.js"></script>
      <script>mermaid.initialize({"startOnLoad":true});</script>
      <script src="file:///path/extension/media/main.js"></script>
    </body>
    </html>`;

    const mockedFileSystemService = mock<FileSystemService>();
    when(mockedFileSystemService.file(anyString())).thenCall((path: string) => {
      return vscode.Uri.file(path);
    });

    const mockedWebView = mock<vscode.Webview>();
    when(mockedWebView.asWebviewUri(anything())).thenCall((uri: vscode.Uri) => {
      return uri;
    });
    const webView = instance(mockedWebView);

    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(webView);

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.onDidError((e: ErrorEvent) => {
      try {
        assert.strictEqual(e.kind, 'error/mermaid-config-json-parse');
        assert.strictEqual(e.message, 'Unexpected end of JSON input');
      } catch (e) {
        done(e);
      }
    });
    diagramWebView.render({
      code: 'Lorem Ipsum',
      mermaidConfig: '{ "test": "config"',
      backgroundColor: 'deep-blue'
    });

    assert.strictEqual(webView.html, expectedHtml);
    done();
  });

  test('should implement "notifyError" for Renderer with onError eventEmitter', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.onDidError((e: ErrorEvent) => {
      let error;
      try {
        assert.strictEqual(e.kind, 'error/renderer');
        assert.strictEqual(e.message, 'renderer faced to dummy error!');
      } catch (e) {
        error = e;
      }
      done(error);
    });

    diagramWebView.notifyError({
      kind: 'error/renderer',
      message: 'renderer faced to dummy error!'
    });
  });

  test('should "dispose" WebViewPanel', () => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));
    let disposeToBeCalled = false;
    when(mockedWebViewPanel.dispose()).thenCall(() => {
      disposeToBeCalled = true;
    });

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.dispose();
    assert.strictEqual(diagramWebView.panel, undefined);
    assert.strictEqual(disposeToBeCalled, true);
  });

  test('should call onDidChangeViewStateActivity only when "activity" is cahgned actually', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));
    when(mockedWebViewPanel.active)
      .thenReturn(true)
      .thenReturn(true)
      .thenReturn(false);

    const webViewPanel = instance(mockedWebViewPanel);
    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      webViewPanel
    );
    diagramWebView.onDidChangeViewStateActivity(state => {
      let error;
      try {
        assert.strictEqual(state, false);
      } catch (e) {
        error = e;
      }
      done(error);
    });
    diagramWebView.onDidChangeViewState({ webviewPanel: webViewPanel }); // true
    diagramWebView.onDidChangeViewState({ webviewPanel: webViewPanel }); // false
  });

  test('should call onDidChangeViewStateVisibility only when "visiblity" is changed actually', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));
    when(mockedWebViewPanel.visible)
      .thenReturn(true)
      .thenReturn(true)
      .thenReturn(false);

    const webViewPanel = instance(mockedWebViewPanel);
    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      webViewPanel
    );
    diagramWebView.onDidChangeViewStateVisibility(state => {
      let error;
      try {
        assert.strictEqual(state, false);
      } catch (e) {
        error = e;
      }
      done(error);
    });
    diagramWebView.onDidChangeViewState({ webviewPanel: webViewPanel }); // true
    diagramWebView.onDidChangeViewState({ webviewPanel: webViewPanel }); // false
  });

  test('should call onDidCaptureImage with image type and data', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.onDidCaptureImage((event: CaptureImageEndEvent) => {
      let error;
      try {
        assert.strictEqual(event.kind, 'capture_image/success');
        if (event.kind === 'capture_image/success') {
          assert.strictEqual(event.data, 'test data: xxxxyyyyzzzz');
          assert.strictEqual(event.type, ImageFileType.JPG);
        }
      } catch (e) {
        error = e;
      }
      done(error);
    });
    diagramWebView.onDidReceiveMessage({
      command: 'onTakeImage',
      type: ImageFileType.JPG,
      data: 'test data: xxxxyyyyzzzz'
    });
  });

  test('should call onFaileTakeImage with error', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.onDidCaptureImage((event: CaptureImageEndEvent) => {
      let error;
      try {
        assert.strictEqual(event.kind, 'capture_image/failure');
        if (event.kind === 'capture_image/failure') {
          assert.strictEqual(event.error.message, 'test error message');
        }
      } catch (e) {
        error = e;
      }
      done(error);
    });
    diagramWebView.onDidReceiveMessage({
      command: 'onFailTakeImage',
      error: new Error('test error message')
    });
  });

  test('should call onError with error when webView content faces to pase error', done => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );
    diagramWebView.onDidError((event: ErrorEvent) => {
      let error;
      try {
        assert.strictEqual(event.kind, 'error/diagram-parse');
        if (event.kind === 'error/diagram-parse') {
          assert.strictEqual(event.message, 'test parse error');
        }
      } catch (e) {
        error = e;
      }
      done(error);
    });
    diagramWebView.onDidReceiveMessage({
      command: 'onParseError',
      error: { str: 'test parse error' }
    });
  });

  test('should call onDidViewRenderRequest when the mermaid document is saved', () => {
    const mockedFileSystemService = mock<FileSystemService>();
    const mockedWebView = mock<vscode.Webview>();
    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebViewPanel.webview).thenReturn(instance(mockedWebView));

    const diagramWebView = new DiagramWebView(
      '/path/extension',
      {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.Beside
      },
      instance(mockedFileSystemService),
      instance(mockedWebViewPanel)
    );

    let calledCount = 0;
    diagramWebView.onDidViewRenderRequested(() => {
      calledCount++;
    });

    diagramWebView.reviel();
    const dummyParams = {
      code: 'Lorem Ipsum',
      mermaidConfig: '{ "test": "config"',
      backgroundColor: 'deep-blue'
    };
    assert.strictEqual(calledCount, 1);
    diagramWebView.render(dummyParams);
    assert.strictEqual(calledCount, 2);
    diagramWebView.updateView(dummyParams);
    assert.strictEqual(calledCount, 3);
  });
});
