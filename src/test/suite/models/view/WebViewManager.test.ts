import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import { mock, when, instance, anything, anyString } from 'ts-mockito';
import * as constants from '../../../../constants';
import WebViewManager from '../../../../models/view/WebViewManager';
import WebViewPanelProvider from '../../../../models/view/WebViewPanelProvider';
import FileSystemService from '../../../../models/FileSystemService';

suite('WebViewManager Tests', function() {
  let registerWebViewPanelSerializerCalled = false;
  test('should register and callback WebViewPanelSelializer', done => {
    const mockedWebViewPanelProvider = mock<WebViewPanelProvider>();
    when(
      mockedWebViewPanelProvider.registerWebviewPanelSerializer(
        constants.PREVIEW_WEBVIEW_VIEWTYPE,
        anything()
      )
    ).thenCall(() => {
      assert.ok('should be called once registerWebViewPanelSerializer');
      registerWebViewPanelSerializerCalled = true;
    });
    const mockedFileSystemService = mock<FileSystemService>();

    const webViewManager = new WebViewManager(
      '/path',
      instance(mockedWebViewPanelProvider),
      instance(mockedFileSystemService)
    );

    const mockedWebview = mock<vscode.Webview>();
    const mockedWebviewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebviewPanel.webview).thenReturn(instance(mockedWebview));
    const webviewPanel = instance(mockedWebviewPanel);
    webViewManager.onDidChangeWebView(e => {
      let error = undefined;
      try {
        assert.strictEqual(e.webView?.panel, webviewPanel);
        assert.strictEqual(registerWebViewPanelSerializerCalled, true);
      } catch (e) {
        error = e;
      }
      done(error);
    });
    webViewManager.deserializeWebviewPanel(webviewPanel, undefined);
  });

  test('should create and return webview when previous view is not held', done => {
    const expectedExtensionPath = '/path/to/extension';
    const expectedNodeModules = vscode.Uri.file(
      path.join(expectedExtensionPath, 'node_modules')
    );
    const expectedMedia = vscode.Uri.file(
      path.join(expectedExtensionPath, 'media')
    );

    const mockedWebViewPanel = mock<vscode.WebviewPanel>();
    const webViewPanel = instance(mockedWebViewPanel);
    const mockedWebViewPanelProvider = mock<WebViewPanelProvider>();
    when(
      mockedWebViewPanelProvider.registerWebviewPanelSerializer(
        constants.PREVIEW_WEBVIEW_VIEWTYPE,
        anything()
      )
    ).thenReturn(anything());
    when(
      mockedWebViewPanelProvider.createWebviewPanel(
        anyString(),
        anyString(),
        anything(),
        anything()
      )
    ).thenCall(
      (
        viewType: string,
        title: string,
        showOptions: {
          viewColumn: vscode.ViewColumn;
          preserveFocus?: boolean | undefined;
        },
        options?:
          | (vscode.WebviewPanelOptions & vscode.WebviewOptions)
          | undefined
      ) => {
        assert.strictEqual(viewType, constants.PREVIEW_WEBVIEW_VIEWTYPE);
        assert.strictEqual(title, 'Mermaid Editor Preview');
        assert.strictEqual(showOptions.preserveFocus, false);
        assert.strictEqual(showOptions.viewColumn, vscode.ViewColumn.Beside);
        assert.strictEqual(options?.enableScripts, true);
        if (options?.localResourceRoots) {
          assert.strictEqual(
            options?.localResourceRoots[0],
            expectedNodeModules
          );
          assert.strictEqual(options?.localResourceRoots[1], expectedMedia);
        } else {
          assert.fail(
            'options or options.localResourceRoots are unexpectedly undefined'
          );
        }
        done();
        return webViewPanel;
      }
    );
    const mockedFileSystemService = mock<FileSystemService>();
    when(
      mockedFileSystemService.file(
        path.join(expectedExtensionPath, 'node_modules')
      )
    ).thenReturn(expectedNodeModules);
    when(
      mockedFileSystemService.file(path.join(expectedExtensionPath, 'media'))
    ).thenReturn(expectedMedia);

    const webViewManager = new WebViewManager(
      expectedExtensionPath,
      instance(mockedWebViewPanelProvider),
      instance(mockedFileSystemService)
    );
    const webView = webViewManager.webView;
    assert.strictEqual(webView.panel, webViewPanel);
    assert.strictEqual(webView.extensionPath, expectedExtensionPath);
    assert.strictEqual(webView.showOptions.preserveFocus, false);
    assert.strictEqual(
      webView.showOptions.viewColumn,
      vscode.ViewColumn.Beside
    );
  });

  test('should return existed webview when it has already been created', done => {
    const mockedWebViewPanelProvider = mock<WebViewPanelProvider>();
    when(
      mockedWebViewPanelProvider.createWebviewPanel(
        anyString(),
        anyString(),
        anything(),
        anything()
      )
    ).thenCall(() => {
      try {
        assert.fail('should not be reached out here');
      } catch (e) {
        done(e);
      }
    });
    const mockedFileSystemService = mock<FileSystemService>();

    const webViewManager = new WebViewManager(
      '/path',
      instance(mockedWebViewPanelProvider),
      instance(mockedFileSystemService)
    );

    // Set DiagramWebView
    const mockedWebview = mock<vscode.Webview>();
    const mockedWebviewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebviewPanel.webview).thenReturn(instance(mockedWebview));
    const webviewPanel = instance(mockedWebviewPanel);
    webViewManager.deserializeWebviewPanel(webviewPanel, undefined);

    const webView = webViewManager.webView;
    assert.strictEqual(webView.panel, webviewPanel);
    done();
  });

  test('should call onDidChangeWebView with undefined when onDidDispose is called', done => {
    const mockedWebViewPanelProvider = mock<WebViewPanelProvider>();
    const mockedFileSystemService = mock<FileSystemService>();

    const webViewManager = new WebViewManager(
      '/path',
      instance(mockedWebViewPanelProvider),
      instance(mockedFileSystemService)
    );

    // Set DiagramWebView
    const mockedWebview = mock<vscode.Webview>();
    const mockedWebviewPanel = mock<vscode.WebviewPanel>();
    when(mockedWebviewPanel.webview).thenReturn(instance(mockedWebview));
    const webviewPanel = instance(mockedWebviewPanel);
    webViewManager.deserializeWebviewPanel(webviewPanel, undefined);
    webViewManager.onDidChangeWebView(e => {
      let error;
      try {
        assert.strictEqual(e.webView, undefined);
      } catch (e) {
        error = e;
      }
      done(error);
    });

    webViewManager.onDidDispose();
  });
});
