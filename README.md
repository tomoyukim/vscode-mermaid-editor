# Mermaid Editor

[![Version](https://vsmarketplacebadge.apphb.com/version/tomoyukim.vscode-mermaid-editor.svg
)](https://marketplace.visualstudio.com/items?itemName=tomoyukim.vscode-mermaid-editor)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/tomoyukim.vscode-mermaid-editor.svg
)](https://marketplace.visualstudio.com/items?itemName=tomoyukim.vscode-mermaid-editor)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating-short/tomoyukim.vscode-mermaid-editor.svg
)](https://marketplace.visualstudio.com/items?itemName=tomoyukim.vscode-mermaid-editor)

Mermaid Editor is vscode extension inspired by [official mermaid live editor](https://mermaidjs.github.io/mermaid-live-editor/) to provide the following features:
- Live edit `.mmd` file with [mermaid.js](https://mermaidjs.github.io/) diagram
- Generate image file from `.mmd` file with preferred format (png, jpg, webp and svg).

## Usage

The extension is activated when opening `.mmd` file.

### Open live preview

- Select `Mermaid:Preview mermaid` from context menu or command palette
- Click `Mermaid:Preview diagram` icon at right corner
- `ctrl+alt+[` on `.mmd` file

![](https://user-images.githubusercontent.com/1187581/78126099-efef5f00-744c-11ea-9a07-370d9714621d.png)
![](https://user-images.githubusercontent.com/1187581/78126199-1e6d3a00-744d-11ea-8c79-25f6f1c08517.png)

### Generate image

Generate command is only available when `.mmd` file is opened and live preview is activated.

- Select `Mermaid:Generate image` from context menu or command palette
- Click `Mermaid:Generate image` icon
- `ctrl+alt+]` on `.mmd` file

![](https://user-images.githubusercontent.com/1187581/78126965-4e690d00-744e-11ea-96be-d59cf0965e26.png)
![](https://user-images.githubusercontent.com/1187581/78127020-6345a080-744e-11ea-9ad0-d2f24dec4d1e.png)

### Change scale of live preview

Zoom in/out is supported for live preview.

- Select `Mermaid:Zoom in`, `Mermaid:Zoom out`, `Mermaid:Reset zoom`, `Mermaid:Zoom to specific scale` from command palette
- Click `Mermaid:Zoom in`, `Mermaid:Zoom out` icon focusing live preview panel
- Zoom out: `ctrl+alt+-`
- Zoom in: `ctrl+alt+=`
- Reset zoom: `ctrl+alt+0`

![](https://user-images.githubusercontent.com/1187581/78127053-76587080-744e-11ea-9861-c4a4dc71a4fe.png)

## Attributes

This extension supports attribute to specify preferred configuration for each `.mmd` file. The attribute have to be described in comment of mermaid syntax.

### @config{path_to_config}

Each `.mmd` file can be associated with [mermaid configuration](https://mermaid-js.github.io/mermaid/#/mermaidAPI?id=configuration). With this attribute, `.mmd` file can read specified configuration. `path_to_config` have to be described as relative path to the config json file from associated `.mmd` file.

```
sequenceDiagram
%% @config{./path/to/config.json}
    Alice->>John: Hello John, how are you?
```

## Configuration

Settings for look & feel in preview or image generator.

|Setting|Default|Description|
|---|---|---|
|mermaid-editor.preview.theme|default|color theme for live preview and generated image [default, forest, dark, natural]|
|mermaid-editor.preview.backgroundColor|transparent|background color for live preview and generated image|
|mermaid-editor.generate.type|svg|output image file type [svg, png, jpg, webp]|
|mermaid-editor.generate.outputPath||relative path of the output target directory from project root|
|mermaid-editor.generate.useCurrentPath|true|use relative output path as same as target mmd file instead of 'outputPath'|
|mermaid-editor.generate.width|800|width of the output image|
|mermaid-editor.generate.height|600|height of the output image|


## Credits
This extension uses [Feather icon set](https://www.iconfinder.com/iconsets/feather) under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)