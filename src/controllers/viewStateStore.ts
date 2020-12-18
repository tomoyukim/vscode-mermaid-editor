import { createStore, Store } from 'redux';
import MermaidDocument from '../models/editor/MermaidDocument';

interface ChangeMermaidDocumentEvent {
  type: 'event/change_mermaid_event';
  payload: MermaidDocument;
}
export const createChangeMermaidDocumentEvent = (
  mermaidDocument: MermaidDocument
): ChangeMermaidDocumentEvent => ({
  type: 'event/change_mermaid_event',
  payload: mermaidDocument
});

interface ChangePreviewConfigBackgroundColorEvent {
  type: 'event/change_preview_config/background_color';
  payload: string;
}
export const createChangePreviewConfigBackgroundColorEvent = (
  backgroundColor: string
): ChangePreviewConfigBackgroundColorEvent => ({
  type: 'event/change_preview_config/background_color',
  payload: backgroundColor
});

interface ChangePreviewConfigDefaultMermaidConfigEvent {
  type: 'event/change_preview_config/default_mermaid_config';
  payload: string;
}
export const createChangePreviewConfigDefaultMermaidConfigEvent = (
  defaultMermaidConfig: string
): ChangePreviewConfigDefaultMermaidConfigEvent => ({
  type: 'event/change_preview_config/default_mermaid_config',
  payload: defaultMermaidConfig
});

export type ViewStateAction =
  | ChangeMermaidDocumentEvent
  | ChangePreviewConfigBackgroundColorEvent
  | ChangePreviewConfigDefaultMermaidConfigEvent;

export type ViewState = {
  mermaidDocument: MermaidDocument;
  defaultMermaidConfig: string;
  backgroundColor: string;
};
const DEFAULT_VIEW_STATE: ViewState = {
  mermaidDocument: new MermaidDocument(),
  defaultMermaidConfig: '',
  backgroundColor: ''
};

const viewStateReducer = (
  state = DEFAULT_VIEW_STATE,
  action: ViewStateAction
): ViewState => {
  switch (action.type) {
    case 'event/change_mermaid_event':
      return {
        ...state,
        mermaidDocument: action.payload
      };
    case 'event/change_preview_config/background_color':
      return {
        ...state,
        backgroundColor: action.payload
      };
    case 'event/change_preview_config/default_mermaid_config':
      return {
        ...state,
        defaultMermaidConfig: action.payload
      };
    default:
      return state;
  }
};

const createViewStateStore = (
  initialState: ViewState
): Store<ViewState, ViewStateAction> => {
  return createStore(viewStateReducer, initialState);
};

export default createViewStateStore;
