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

## [Unreleased]

### Added
- Support for `fontawesome` icons

### Changed

- Update dependency 'mermaid'

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