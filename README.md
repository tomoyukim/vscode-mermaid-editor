# Mermaid Editor

Mermaid Editor is vscode extension for editing [mermaid.js](https://mermaidjs.github.io/) diagram inspired by [official mermaid live editor](https://mermaidjs.github.io/mermaid-live-editor/). This extension provides live preview and creating the image file.

## Usage

The extension is activated when opening `.mmd` file.

### Open live preview

- Select `Mermaid:Preview mermaid` from context menu or command palette
- Click `Mermaid:Preview diagram` icon
- `ctrl+alt+[` on `.mmd` file

### Generate image

Generate command is only available when `.mmd` file is opened and live preview is activated.

- Select `Mermaid:Generate image` from context menu or command palette
- Click `Mermaid:Generate image` icon
- `ctrl+alt+]` on `.mmd` file

### Change scale of live preview

Zoom in/out is supported for live preview.

- Select `Mermaid:Zoom in`, `Mermaid:Zoom out`, `Mermaid:Reset zoom`, `Mermaid:Zoom to specific scale` from command palette
- Click `Mermaid:Zoom in`, `Mermaid:Zoom out` icon focusing live preview panel
- Zoom out: `ctrl+alt+-`
- Zoom in: `ctrl+alt+=`
- Reset zoom: `ctrl+alt+0`

## Configuration

|Setting|Default|Description|
|---|---|---|
|mermaid-editor.preview.theme|default|color theme for live preview and generated image [default, forest, dark, natural]|
|mermaid-editor.generate.backgroundColor|transparent|background color for live preview and generated image|
|mermaid-editor.generate.type|svg|output image file type [svg, png, jpg, webp]|
|mermaid-editor.generate.outputPath||relative path of the output target directory from project root|
|mermaid-editor.generate.width|800|width of the output image|
|mermaid-editor.generate.height|600|height of the output image|


## Credits
This extension uses [Feather icon set](https://www.iconfinder.com/iconsets/feather) under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)