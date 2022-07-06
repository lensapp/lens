/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { TerminalChannels, type TerminalMessage } from "../../common/terminal/channels";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";

export type DefaultWebsocketParams = typeof defaultWebsocketParamsInjectable extends Injectable<infer T, any, any> ? T : never;

const defaultWebsocketParamsInjectable = getInjectable({
  id: "default-websocket-params",
  instantiate: (di) => ({
    logging: di.inject(isDevelopmentInjectable),
    reconnectDelay: 10,
    flushOnOpen: true,
    pingMessage: JSON.stringify({ type: TerminalChannels.PING } as TerminalMessage),
  }),
});

export default defaultWebsocketParamsInjectable;
