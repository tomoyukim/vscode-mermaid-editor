import * as path from 'path';
import FileSystemService from './FileSystemService';

export const ImageFileType = {
  SVG: 'svg',
  PNG: 'png',
  JPG: 'jpg',
  WEBP: 'webp'
} as const;
export type ImageFileType = typeof ImageFileType[keyof typeof ImageFileType];

class FileGeneratorService {
  private _fileSystemService: FileSystemService;

  constructor(fileSystemService: FileSystemService) {
    this._fileSystemService = fileSystemService;
  }

  private _convertImageTypeToString(type: ImageFileType): string {
    switch (type) {
      case ImageFileType.PNG:
      case ImageFileType.JPG:
      case ImageFileType.WEBP:
        return type;
      default:
        return ImageFileType.SVG;
    }
  }

  private _getOutputFilePath(
    dirPath: string,
    fileName: string,
    type: ImageFileType
  ): string {
    const _fileName = `${path.basename(
      fileName,
      '.mmd'
    )}.${this._convertImageTypeToString(type)}`;
    return path.join(dirPath, _fileName);
  }

  public async outputFile(
    data: string,
    dirPath: string,
    fileName: string,
    type: ImageFileType
  ): Promise<void> {
    const output = this._getOutputFilePath(dirPath, fileName, type);
    const uri = this._fileSystemService.file(output);
    const buffer = Buffer.from(data, 'base64');
    try {
      await this._fileSystemService.writeFile(uri, buffer);
    } catch (e) {
      throw e;
    }
  }
}

export default FileGeneratorService;
