/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TerminalMessage } from "../../common/terminal/channels";
import { TerminalChannels } from "../../common/terminal/channels";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";

export type DefaultWebsocketApiParams = ReturnType<typeof defaultWebsocketApiParamsInjectable.instantiate>;

const defaultWebsocketApiParamsInjectable = getInjectable({
  id: "default-websocket-api-params",
  instantiate: (di) => ({
    logging: di.inject(isDevelopmentInjectable),
    reconnectDelay: 10,
    flushOnOpen: true,
    pingMessage: JSON.stringify({ type: TerminalChannels.PING } as TerminalMessage),
  }),
});

export default defaultWebsocketApiParamsInjectable;
