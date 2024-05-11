import { Theme } from '@/stores/preferences';

export interface Bridge {
  postMessage: (message: string) => void;
}

export type PostMessage = (message: string) => void;

export enum AppMessageType {
  SetBlocks = 'SET_BLOCKS',
  SetTheme = 'SET_THEME',
  Ok = 'SUCCESS',
  Error = 'ERROR',
}

export interface AppMessage {
  readonly id: string;
  readonly type: AppMessageType;
}

export interface SetBlocksAppMessage extends AppMessage {
  readonly type: AppMessageType.SetBlocks;
  readonly blocks: string;
}

export interface SetThemeAppMessage extends AppMessage {
  readonly type: AppMessageType.SetTheme;
  readonly theme: Theme;
}

export interface SuccessAppMessage extends AppMessage {
  readonly type: AppMessageType.Ok;
}

export interface ErrorAppMessage extends AppMessage {
  readonly type: AppMessageType.Error;
  readonly reason: string;
}

export type AppMessages = SetBlocksAppMessage | SuccessAppMessage | ErrorAppMessage;

export enum WebMessageType {
  Ready = 'READY',
  HeightChange = 'HEIGHT_CHANGE',
  Error = 'ERROR',
}

export interface WebMessage {
  readonly id: string;
  readonly type: WebMessageType;
}

export interface ReadyWebMessage extends WebMessage {
  readonly type: WebMessageType.Ready;
}
export interface HeightChangeWebMessage extends WebMessage {
  readonly type: WebMessageType.HeightChange;
  readonly height: number;
}

export interface ErrorWebMessage extends WebMessage {
  readonly type: WebMessageType.Error;
  readonly reason: string;
}
