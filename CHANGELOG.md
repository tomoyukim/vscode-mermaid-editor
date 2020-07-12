# Change Log

All notable changes to the "mermaid-editor" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [0.7.0] - 2020-7-12

### Added

- Revert `mermaid-editor.preview.theme` in order to support default theme config without mermaid config

### Changed

- Support restoring horizontal scroll position - Thank to [PR#14](https://github.com/tomoyukim/vscode-mermaid-editor/issues/14) by Yedid ([@Yerhabe](https://github.com/Yerhabe))
- Change enum from free word for `mermaid-editor.preview theme` and `mermaid-editor.generate.type` VS code config
- Support absolute path and `~` for HOME in `mermaid-editor.preview.defaultMermaidConfig` in VS code config

### Fixed

- `<br>` tag in `graph` diagram is changed to be ignored in order to avoid image generation error reported by [Issue#12](https://github.com/tomoyukim/vscode-mermaid-editor/issues/12). It's not expected behavior maybe but I hope it can be fixed by original library; mermaid.js
  - This symptom is caused by unescaped `<br>` tag in generated `svg` tag. Current image generation depends on `canvas` which loads `svg` image. It fails to load the image if `<br>` tag is contained as raw tag. It should be treated as `<text>` in SVG or line feed correctly. I put a bug report for mermaid.js about it. [mermaid.js Issue$1504](https://github.com/mermaid-js/mermaid/issues/1504)
  - **Note**: The patch implemented in this version is not perfect. mermaid.js seems to ignore the escape letters for `<br>` tag and render it as line feed when starting this extension or VS code with the preview. In the case, you can escape it correctly by changing active editor or editting your diagram.

## [0.6.0] - 2020-5-27

### Added

- Newly support __attribute__ description to specify mermaidjs config or preview background color in each `.mmd` file. For the detail, please refer to README
- Add new VSCode config; `mermaid-editor.preview.defaultMermaidConfig` to setup default mermaidjs config file

### Changed

- Remove `mermaid-editor.preview.theme` from VSCode configuration for Mermaid Editor extension
  - Instead, `mermaid-editor.preview.defaultMermaidConfig` is added
- Change `mermaid-editor.preview.backgroundColor` to be used as default background color for the preview
- Change handling parse error
  - Keep previous diagram in case of parse error during edit
  - Change error message to put in output channel with the detail

### Removed

- Remove tslint.config (internal)
- Remove eslint warnings (internal)

## [0.5.1] - 2020-5-17

### Changed

- Adopt `webview.asWebviewUri` API for local resource. - Thank to [Issue#11](https://github.com/tomoyukim/vscode-mermaid-editor/issues/11) by Matt Bierner ([@mjbvz](https://github.com/mjbvz))


### Security

- Update dependencies by security alert from Github


## [0.5.0] - 2020-4-1

### Added

- Support for keeping scroll position in preview as much as possible
  - Scroll position will be kept during editing `mmd` file but will be reset when parse error is occurred so far.
- Display error message in preview in case of pase error

### Changed

- Replace tslint with eslint

### Security

- Update dependencies by security alert from Github

## [0.4.4] - 2020-1-15

### Added
- Support for `fontawesome` icons - thanks to [PR#8](https://github.com/tomoyukim/vscode-mermaid-editor/pull/8) by Peter Garland ([@pngarland](https://github.com/pngarland))

### Changed

- Update dependency 'mermaid' to version 8.4
- Migrage vscode extension test modules following by [official guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension#migrating-from-vscode)

## [0.4.3] - 2019-10-06

### Added
- Add new setting item: `useCurrentPath` to use current path of editing mmd file as outputPath

### Changed

- Change default background color from 'transparent' to 'white'

### Security

 - Update depencency 'lodash' version by github security alert

## [0.4.2] - 2019-06-18

### Changed

- Change default output directory in case of outside of workspace from `/` to same directory of current edit file

### Fixed

 - Fixed generating image on windows was not worked


## [0.4.1] - 2019-05-11

### Added

- Support zoom in/out for live preview
- Support background color configuration for live preview

### Changed

- `mermaid-editor.generate.backgroundColor` is renamed to `mermaid-editor.preview.backgroundColor`

## [0.4.0] - 2019-05-11

### Added

- ~~Support zoom in/out for live preview~~
- ~~Support background color configuration for live preview~~

### Note

- This version is a mistake. Please do not use.

## [0.3.0] - 2019-05-09

### Added

- Support `jpg` and `webp` type for generating image.

## [0.2.0] - 2019-05-09

### Changed

- Improve preview behavior (in case vscode restart, active editor change, etc.)
- Generator became only available when the preview is activated in addition to openinig `.mmd` file.

### Removed

- `mermaid-editor.generate.theme` is removed and combined with `mermaid-editor.preview.theme`
- `mermaid-editor.generate.format` is renamed to `mermaid-editor.generate.type`
- `pdf` type support of `mermaid-editor.generate.type`

### Fixed

- Fixed the generator cannot export image file

## [0.1.0] - 2019-05-06

- Beta release with basic functions (live preview, image generator)