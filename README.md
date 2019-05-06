# Mermaid Editor

Mermaid Editor is vscode extension for editing [mermaid.js](https://mermaidjs.github.io/) inspired by [official mermaid live editor](https://mermaidjs.github.io/mermaid-live-editor/). This extension provides live preview and creating the image file.

## Usage

The extension is activated when opening `.mmd` file.

### Live edit

- Select `Preview mermaid diagram` from context menu or command palette
- Click `Preview mermaid diagram` icon
- `ctrl+alt+[` on `.mmd` file

### Generate image

- Select `Generate image from mermaid diagram` from context menu or command palette
- Click `Generate image from mermaid diagram` icon
- `ctrl+alt+]` on `.mmd` file

## Configuration

|Setting|Default|Description|
|---|---|---|
|mermaid-editor.preview.theme|default|color theme for live preview [default, forest, dark, natural]|
|mermaid-editor.generate.theme|default|color theme for generating image file [default, forest, dark, natural]|
|mermaid-editor.generate.backgroundColor|white|background color of the output page|
|mermaid-editor.generate.format|svg|output file format [svg, png, pdf]|
|mermaid-editor.generate.outputPath||relative path of the output target directory from project root|
|mermaid-editor.generate.width|800|width of the output page|
|mermaid-editor.generate.height|600|height of the output page|


## Credits
This extension uses [Feather icon set](https://www.iconfinder.com/iconsets/feather) under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)