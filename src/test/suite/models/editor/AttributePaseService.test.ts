import * as assert from 'assert';
import { EndOfLine } from 'vscode';

import AtrributeParseService from '../../../../models/editor/AttributeParseService';

suite('AttributeParser Tests', function() {
  const backgroundColorAcceptableDiagrams = [
    `
    sequenceDiagram
    %% @config(./sample_config.json)
    %% @backgroundColor(#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @config(./sample_config.json)
    Alice->>John: Hello
    Alice->>John: Bye
    %%          @backgroundColor(#ff0000)
    `,
    `
    %%@backgroundColor(#ff0000)
    sequenceDiagram
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @backgroundColor(#ff0000)
    %% @backgroundColor(#123456)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @backgroundColor( #ff0000 )
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @backgroundColor(    #ff0000     ) <- this is background color
    Alice->>John: Hello
    Alice->>John: Bye
    `
  ];

  const configAcceptableDiagrams = [
    `
    sequenceDiagram
    %% @config(./test_config.json)
    %% @backgroundColor(#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @backgroundColor(#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    %%          @config(./test_config.json)
    `,
    `
    %%@config(./test_config.json)
    sequenceDiagram
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @config(./test_config.json)
    %% @config(./dummy_config.json)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @config( ./test_config.json )
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @config(    ./test_config.json     ) <- this is config file
    Alice->>John: Hello
    Alice->>John: Bye
    `
  ];

  const outputScaleAcceptableDiagrams = [
    `
    sequenceDiagram
    %% @outputScale(1.0)
    %% @backgroundColor(#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @backgroundColor(#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    %%          @outputScale(1.0)
    `,
    `
    %%@outputScale(1.0)
    sequenceDiagram
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @outputScale(1.0)
    %% @outputScale(2.0)
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @outputScale( 1.0 )
    Alice->>John: Hello
    Alice->>John: Bye
    `,
    `
    sequenceDiagram
    %% @outputScale(    1.0     ) <- this is outputScale
    Alice->>John: Hello
    Alice->>John: Bye
    `
  ];

  // backgroundColor
  test('parseBackgrondColor should return correct color code', () => {
    const attributeParser = new AtrributeParseService();
    for (const diagram of backgroundColorAcceptableDiagrams) {
      const bgColor = attributeParser.parseBackgroundColor(diagram);
      assert.strictEqual(bgColor, '#ff0000');
    }
  });

  test('parseBackgrondColor should return empty string', () => {
    const diagram = `
    sequenceDiagram
    %% @backgroundColor  (#ff0000)
    Alice->>John: Hello
    Alice->>John: Bye
    `;
    const attributeParser = new AtrributeParseService();
    const bgColor = attributeParser.parseBackgroundColor(diagram);
    assert.strictEqual(bgColor, '');
  });

  test('parseBackgrondColor should return correct color (CRLF)', () => {
    const diagram = `
    sequenceDiagram\r
    %% @backgroundColor(#ff0000)\r
    Alice->>John: Hello\r
    Alice->>John: Bye\r
    `;
    const attributeParser = new AtrributeParseService();
    const bgColor = attributeParser.parseBackgroundColor(
      diagram,
      EndOfLine.CRLF
    );
    assert.strictEqual(bgColor, '#ff0000');
  });

  // config
  test('parseConfig should return correct color code', () => {
    const attributeParser = new AtrributeParseService();
    for (const diagram of configAcceptableDiagrams) {
      const config = attributeParser.parseConfig(diagram);
      assert.strictEqual(config, './test_config.json');
    }
  });

  test('parseConfig should return empty string', () => {
    const diagram = `
    sequenceDiagram
    %% @config  (./test_config.json)
    Alice->>John: Hello
    Alice->>John: Bye
    `;
    const attributeParser = new AtrributeParseService();
    const config = attributeParser.parseConfig(diagram);
    assert.strictEqual(config, '');
  });

  test('parseConfig should return correct config path (CRLF)', () => {
    const diagram = `
    sequenceDiagram\r
    %% @config  (./test_config.json)\r
    Alice->>John: Hello\r
    Alice->>John: Bye\r
    `;
    const attributeParser = new AtrributeParseService();
    const config = attributeParser.parseConfig(diagram, EndOfLine.CRLF);
    assert.strictEqual(config, '');
  });

  // outputScale
  test('parseOutputScale should return correct value', () => {
    const attributeParser = new AtrributeParseService();
    for (const diagram of outputScaleAcceptableDiagrams) {
      const scale = attributeParser.parseOutputScale(diagram);
      assert.strictEqual(scale, '1.0');
    }
  });

  test('parseOutputScale should return empty string', () => {
    const diagram = `
    sequenceDiagram
    %% @outputScale  (1.0)
    Alice->>John: Hello
    Alice->>John: Bye
    `;
    const attributeParser = new AtrributeParseService();
    const scale = attributeParser.parseOutputScale(diagram);
    assert.strictEqual(scale, '');
  });

  test('parseOutputScale should return correct scale (CRLF)', () => {
    const diagram = `
    sequenceDiagram\r
    %% @outputScale  (1.0)\r
    Alice->>John: Hello\r
    Alice->>John: Bye\r
    `;
    const attributeParser = new AtrributeParseService();
    const scale = attributeParser.parseOutputScale(diagram, EndOfLine.CRLF);
    assert.strictEqual(scale, '');
  });
});
