import { ImageFileType } from '../models/FileGeneratorService';
import { RendererError } from './Renderer';

// type for params
export interface DiagramWebViewRenderParams {
  code: string;
  mermaidConfig: string;
  backgroundColor: string;
}

export type CaptureImageTarget = 'file' | 'clipboard';

export interface CaptureImageParams {
  type: string;
  scale: number;
  quality: number;
  target: CaptureImageTarget;
}

// type for WebView message event
export interface WebViewEventOnTakeImage {
  command: 'onTakeImage';
  type: ImageFileType;
  data: string;
}

export interface WebViewEventOnCopyImage {
  command: 'onCopyImage';
}

export interface WebViewEventOnFaileTakeImage {
  command: 'onFailTakeImage';
  error: any;
}

export interface WebViewEventOnParseError {
  command: 'onParseError';
  error: any;
}

export type WebViewEvent =
  | WebViewEventOnTakeImage
  | WebViewEventOnCopyImage
  | WebViewEventOnFaileTakeImage
  | WebViewEventOnParseError;

// type for image capture event
export interface CaptureImageSuccess {
  kind: 'capture_image/success';
  type: ImageFileType;
  data: string;
}

export interface CopyImageClipboard {
  kind: 'copy_image_clipboard';
}

export interface CaptureImageFailure {
  kind: 'capture_image/failure';
  error: Error;
}

export type CaptureImageEndEvent =
  | CaptureImageSuccess
  | CopyImageClipboard
  | CaptureImageFailure;

// type for errors
export interface DiagramParseError {
  kind: 'error/diagram-parse';
  message: string;
}

export interface MermaidConfigJsonParseError {
  kind: 'error/mermaid-config-json-parse';
  message: string;
}

export type ErrorEvent =
  | DiagramParseError
  | MermaidConfigJsonParseError
  | RendererError;
