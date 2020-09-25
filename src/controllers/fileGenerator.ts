import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import mkdirp = require('mkdirp');
import get = require('lodash/get');
import * as constants from '../constants';
import Logger from '../Logger';
import VSCodeWrapper from '../VSCodeWrapper';

export const ImageFileType = {
  SVG: 'svg',
  PNG: 'png',
  JPG: 'jpg',
  WEBP: 'webp'
} as const;
export type ImageFileType = typeof ImageFileType[keyof typeof ImageFileType];

function getSupportedExtension(type: ImageFileType): string {
  switch (type) {
    case ImageFileType.PNG:
    case ImageFileType.JPG:
    case ImageFileType.WEBP:
      return type;
    default:
      return ImageFileType.SVG;
  }
}

function getOutputDirPath(
  vscodeWrapper: VSCodeWrapper,
  fileName: string
): string {
  const editor = vscodeWrapper.activeTextEditor;
  const uri = get(editor, 'document.uri', {});
  const currentDir = path.dirname(fileName);
  const workingDir = get(
    vscodeWrapper.getWorkspaceFolder(uri),
    'uri.fsPath',
    currentDir
  );

  const userConfig = vscodeWrapper.getConfiguration(
    constants.CONFIG_SECTION_ME_GENERATE
  );
  if (userConfig.useCurrentPath) {
    return currentDir;
  }
  return userConfig.outputPath
    ? path.join(workingDir, userConfig.outputPath)
    : workingDir;
}

function getOutputFilePath(
  outputDirPath: string,
  fileName: string,
  type: ImageFileType
): string {
  const _fileName = `${path.basename(fileName, '.mmd')}.${getSupportedExtension(
    type
  )}`;
  return path.join(outputDirPath, _fileName);
}

export async function outputFile(
  context: vscode.ExtensionContext,
  data: string,
  type: ImageFileType
): Promise<void> {
  const vscodeWrapper = new VSCodeWrapper();
  const logger = new Logger();
  const editor = vscodeWrapper.activeTextEditor;
  if (!editor) {
    return;
  }

  const fileName: string = get(editor, 'document.fileName', '');
  let outputDirPath = getOutputDirPath(vscodeWrapper, fileName);

  try {
    await mkdirp(outputDirPath);
  } catch (e) {
    logger.appendLine(e.message);
    outputDirPath = context.extensionPath;
  }

  const output = getOutputFilePath(outputDirPath, fileName, type);
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(output, data, 'base64', e => {
      if (e) {
        reject(e);
      } else {
        resolve();
      }
    });
  });
}
