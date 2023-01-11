/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export enum TerminalChannels {
  STDIN = "stdin",
  STDOUT = "stdout",
  CONNECTED = "connected",
  RESIZE = "resize",
  PING = "ping",
}

export type TerminalMessage = {
  type: TerminalChannels.STDIN;
  data: string;
} | {
  type: TerminalChannels.STDOUT;
  data: string;
} | {
  type: TerminalChannels.CONNECTED;
} | {
  type: TerminalChannels.RESIZE;
  data: {
    width: number;
    height: number;
  };
} | {
  type: TerminalChannels.PING;
};
