/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type CreateWebsocket = (url: string) => WebSocket;

const createWebsocketInjectable = getInjectable({
  id: "create-websocket",
  instantiate: (): CreateWebsocket => (url) => new WebSocket(url),
});

export default createWebsocketInjectable;
