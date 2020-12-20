import { ImageFileType } from '../models/FileGeneratorService';
import { RendererError } from './Renderer';

// type for params
export interface DiagramWebViewRenderParams {
  code: string;
  mermaidConfig: string;
  backgroundColor: string;
}

export interface CaptureImageParams {
  type: string;
  width: string;
  height: string;
}

// type for WebView message event
export interface WebViewEventOnTakeImage {
  command: 'onTakeImage';
  type: ImageFileType;
  data: string;
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
  | WebViewEventOnFaileTakeImage
  | WebViewEventOnParseError;

// type for image capture event
export interface CaptureImageSuccess {
  kind: 'capture_image/success';
  type: ImageFileType;
  data: string;
}

export interface CaptureImageFailure {
  kind: 'capture_image/failure';
  error: Error;
}

export type CaptureImageEndEvent = CaptureImageSuccess | CaptureImageFailure;

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
