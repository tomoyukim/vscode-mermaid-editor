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

## [0.19.1] - 2023-8-31

### Changed

- Upscale the logo

## [0.19.0] - 2023-8-31

### Added

- Support `.mermaid` extension in addition to `.mmd`
- Add a new feature to change mermaid library without the extension update

### Changed

- Introduce a new logo
  - The old one has not been appropriate by supporting `.mermaid` extension additionally
- Bump mermaid version to 10.3.0
- Bump the minimum support vscode version to 1.75.0
- Bump typescript to 5.1

### Fixed

- Fix the bug reported by [Issue#81](https://github.com/tomoyukim/vscode-mermaid-editor/issues/81)
  - Clipboard copy did not work expectedly in case `svg` was selected for the output file format

## [0.18.1] - 2023-2-25

### Fixed

- Fix unit test broken by v0.18.0

## [0.18.0] - 2023-2-25

### Changed

- Bump mermaid version to 9.4.0
  - Thanks to [@KajiTetsushi](https://github.com/KajiTetsushi)'s contribution in [PR#73](https://github.com/tomoyukim/vscode-mermaid-editor/pull/73)
  - This version officially supports mindmap syntax that is required in [Issue#69](https://github.com/tomoyukim/vscode-mermaid-editor/issues/69)
- Add more descriptions about Mermaid Editor including how this extension works without any remote solution
  - Thanks to [@sadsimulation](https://github.com/sadsimulation)'s suggestion in [Issue#74](https://github.com/tomoyukim/vscode-mermaid-editor/issues/74)

### Removed

- Remove SVG badges from README in order to release Mermaid Editor to Open VSX.

## [0.17.1] - 2022-11-4

### Fixed

- Revert the change for SVG badges in README
  - For details, refer to [this issue](https://github.com/cssho/VSMarketplaceBadge/issues/18#issuecomment-1302908377)

## [0.17.0] - 2022-11-4

### Added

- Add new feature to copy the image to clipboard directly without saving file
  - Thanks to [@leighmcculloch](https://github.com/leighmcculloch)'s suggestion in [Issue#55](https://github.com/tomoyukim/vscode-mermaid-editor/issues/55)

## [0.16.0] - 2022-11-3

### Changed

- Bump mermaid version to 9.2.0

## [0.15.0] - 2022-7-29

### Changed

- Bump mermaid version to 9.1.3

### Security

- Bump some dependencies.
  - [PR#61](https://github.com/tomoyukim/vscode-mermaid-editor/pull/61)
  - [PR#64](https://github.com/tomoyukim/vscode-mermaid-editor/pull/64)
  - [PR#65](https://github.com/tomoyukim/vscode-mermaid-editor/pull/65)
  - vsce

## [0.14.0] - 2022-1-23

### Changed

- Bump mermaid version to 8.13.10 ([Issue#58](https://github.com/bpruitt-goddard/vscode-mermaid-syntax-highlight/pull/63))

### Removed

- Remove syntax highlighting - Thanks to [PR#59](https://github.com/bpruitt-goddard/vscode-mermaid-syntax-highlight/pull/63) by [@rngtng](https://github.com/rngtng)
  - Current syntax highlighting doesn't work fine. Some users suggested me to use [vscode-mermaid-syntax-highlight](https://github.com/bpruitt-goddard/vscode-mermaid-syntax-highlight) and I agreed. For more detail, see [Issue#41](https://github.com/bpruitt-goddard/vscode-mermaid-syntax-highlight/pull/63)

### Security

- Fix nanoid version to 3.1.31

## [0.13.0] - 2022-1-16

### Security

- Bump mermaid version to 8.13.8

- Removed vsce from local dependencies

## [0.12.0] - 2021-12-24

### Added

- Introduced a new config `mermaid-editor.generate.quality` to set a image quality for creating images like jpeg or webp.
  - Related to a requirement in [Issue#24](https://github.com/tomoyukim/vscode-mermaid-editor/issues/24).

### Deprecated

- The attribute syntax with curly brackets like `@config{}` was deprecated. Use a new syntax with parenthesis like `@config()` instead.
  - Related to [Issue#35](https://github.com/tbomoyukim/vscode-mermaid-editor/issues/35).

### Fixed

- Fixed to create svg image with the background color.
  - Related to [Issue#24](https://github.com/tbomoyukim/vscode-mermaid-editor/issues/24).

### Security

- Bump some packages following a security report by Github

## [0.11.5] - 2021-12-21

### Fixed

- Fix a bug [Issue#56](https://github.com/tomoyukim/vscode-mermaid-editor/issues/56)

## [0.11.4] - 2021-9-23

### Fixed

- Revert vsce command dependency which was removed unexpectedly.

## [0.11.3] - 2021-9-23

### Changed

- Bump mermaid-js version from 8.11.2 to 8.12.1

- Replace Fontawesome CDN with KitCode to support the latest version without updating the extension

### Security

- Bump some packages following a security report by Github

## [0.11.2] - 2021-8-1

### Changed

- Bump mermaid-js version from 8.9.2 to 8.11.2
  - Thanks for the headsup to [Issue#47](https://github.com/tomoyukim/vscode-mermaid-editor/issues/47)

## [0.11.1] - 2021-7-3

### Changed

- Bump awesome font version from 4.7.0 to 5.15.3 - Thanks to [PR#45](https://github.com/tomoyukim/vscode-mermaid-editor/pull/45) by [@jkamenik](https://github.com/jkamenik)

### Security

- Bump some packages following a security report by Github

## [0.11.0] - 2021-4-24

### Added

- `mermaid-editor.generate.scale` config is added.
  - Related to a requirement in [Issue#17](https://github.com/tomoyukim/vscode-mermaid-editor/issues/17).

### Removed

- `mermaid-editor.generate.width` and `mermaid-editor.generate.height` are removed instead of the scale config.

### Fixed

- [Issue#39](https://github.com/tomoyukim/vscode-mermaid-editor/issues/39)

  - Fix an error paring atrribute in a file with CRLF.

- [Issue#40](https://github.com/tomoyukim/vscode-mermaid-editor/issues/40)
  - Fix generated image cropped unexpectedly. This is also related to `mermaid-editor.generate.scale` config.

### Security

- Fix [vulnerability report](https://github.com/tomoyukim/vscode-mermaid-editor/pull/38) bumping mocha from 7.0.2 to 8.2.2.

## [0.10.1] - 2021-3-28

### Changed

- Add husky hook to check lint before push.

### Fixed

- Fix `Collections.Queue is not a constructor` error.
  - Remove typescript-collections and add simple Queue class instead.

### Security

- Fix [vulnerability report](https://github.com/tomoyukim/vscode-mermaid-editor/pull/33) from Github by updating webpack version from 4.44.1 to 5.28.0.
- Fix vulnerability report from Github by merging [PR#37](https://github.com/tomoyukim/vscode-mermaid-editor/pull/37).

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
