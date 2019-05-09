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