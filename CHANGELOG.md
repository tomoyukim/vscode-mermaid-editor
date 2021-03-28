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

## [0.10.1] - 2021-3-28

### Changed

- Add husky hook to check lint before push.

### Fixed

- Fix `Collections.Queue is not a constructor` error.
  - Remove typescript-collections and add simple Queue class instead.
### Security

- Fix [vulnerability report](https://github.com/tomoyukim/vscode-mermaid-editor/pull/33) from Github by updating webpack version from 4.44.1 to 5.28.0.
- Fix vulnerability report from Github by merging [PR#37](https://github.com/tomoyukim/vscode-mermaid-editor/pull/37)

## [0.10.0] - 2021-2-20

### Added

- [Issue#22](https://github.com/tomoyukim/vscode-mermaid-editor/issues/22)
  - `mermaid-editor.preview.errorOutputOnSave` config is added.

### Changed

- [Issue#22](https://github.com/tomoyukim/vscode-mermaid-editor/issues/22)
  - Only error message as the result of parsing latest document is shown. Old messages is cleared when the document is edited.
  - Showing error output console during editing is suppressed. This can be automatically shown only when the document is saved if `mermaid-editor.preview.errorOutputOnSave` is true.

## [0.9.2] - 2020-12-30

### Fixed

- Fix unit test break by v0.9.1

## [0.9.1] - 2020-12-30

### Fixed

- [Issue#31](https://github.com/tomoyukim/vscode-mermaid-editor/issues/31)
  - Fix previewer bug caused by publishing with webpack. `mermaid.js` package have to be published even when `node_modules` is excluded.

## [0.9.0] - 2020-12-24

### Changed

- Introduce webpack to reduce extension size
- Update mermaid.js version to 8.8.0
- Refactoring whole extension code to separate it into each functional and independent module for unit testing
- Introduce unit test for most part of the extension for future maintenance
- Change zoom interval, max and min values

### Fixed

- [Issue#20](https://github.com/tomoyukim/vscode-mermaid-editor/issues/20), [Issue#27](https://github.com/tomoyukim/vscode-mermaid-editor/issues/27): Fix generation error([5f92e970](https://github.com/tomoyukim/vscode-mermaid-editor/commit/5f92e9704b721d164e971a8f50aa2f84e8c4e496))
- [Issue#29](https://github.com/tomoyukim/vscode-mermaid-editor/issues/29)
- [Issue#30](https://github.com/tomoyukim/vscode-mermaid-editor/issues/30)

### Security

- Update `init` package version by updating `webpack-cli` version ([33a14517](https://github.com/tomoyukim/vscode-mermaid-editor/commit/33a145177a626bd186e975c9f95d4091ccd2ff3b))
  - Pointed out by [PR#28](https://github.com/tomoyukim/vscode-mermaid-editor/pull/28)

## [0.8.1] - 2020-9-07

### Fixed

- Fix generator error around canvas operation for svg tag by correcting xml serialization process. [5fd6a76](https://github.com/tomoyukim/vscode-mermaid-editor/commit/5fd6a7604084eac65770a11b7b1e4bd6994e8929)
  - To [Issue#12](https://github.com/tomoyukim/vscode-mermaid-editor/issues/12): remove previous patch to escapse `<br/>` tag in svg
  - To [Issue#18](https://github.com/tomoyukim/vscode-mermaid-editor/issues/18): fix the behavior by above patch

### Note

- Setup CI pipeline on Azure
  - Setup extension test project configuration
  - Add `azure-pipeline.yaml` to run pipeline for master
  - Add publish step in the pipeline to publish the extension on Azure
- Change main package manager from `npm` to `yarn`

## [0.8.0] - 2020-8-29

### Added

- Support syntax hightlight referring to [official live editor](https://github.com/mermaid-js/mermaid-live-editor/blob/master/src/components/editor-utils.js).

## [0.7.1] - 2020-8-19

### Security

- Bump lodash from 4.17.15 to 4.17.19

## [0.7.0] - 2020-7-12

### Added

- Revert `mermaid-editor.preview.theme` in order to support default theme config without mermaid config

### Changed

- Support restoring horizontal scroll position - Thank to [PR#14](https://github.com/tomoyukim/vscode-mermaid-editor/issues/14) by Yedid ([@Yerhabe](https://github.com/Yerhabe))
- Change enum from free word for `mermaid-editor.preview theme` and `mermaid-editor.generate.type` VS code config
- Support absolute path and `~` for HOME in `mermaid-editor.preview.defaultMermaidConfig` in VS code config

### Fixed

- `<br>` tag in `graph` diagram is changed to be ignored in order to avoid image generation error reported by [Issue#12](https://github.com/tomoyukim/vscode-mermaid-editor/issues/12). It's not expected behavior maybe but I hope it can be fixed by original library; mermaid.js
  - This symptom is caused by unescaped `<br>` tag in generated `svg` tag. Current image generation depends on `canvas` which loads `svg` image. It fails to load the image if `<br>` tag is contained as raw tag. It should be treated as `<text>` in SVG or line feed correctly. I put a bug report for mermaid.js about it. [mermaid.js Issue\$1504](https://github.com/mermaid-js/mermaid/issues/1504)
  - **Note**: The patch implemented in this version is not perfect. mermaid.js seems to ignore the escape letters for `<br>` tag and render it as line feed when starting this extension or VS code with the preview. In the case, you can escape it correctly by changing active editor or editting your diagram.

## [0.6.0] - 2020-5-27

### Added

- Newly support **attribute** description to specify mermaidjs config or preview background color in each `.mmd` file. For the detail, please refer to README
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
