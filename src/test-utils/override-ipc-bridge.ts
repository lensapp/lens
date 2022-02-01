/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import EventEmitter from "events";
import ipcHandleInjectable from "../main/communication/ipc-handle.injectable";
import ipcMainOnInjectable from "../main/communication/ipc-on.injectable";
import ipcRendererOnInjectable from "../renderer/communication/ipc-on.injectable";
import ipcInvokeInjectable from "../renderer/communication/ipc-invoke.injectable";
import broadcastInjectable from "../common/communication/broadcast.injectable";

interface OverrideIpcBridgeContainers {
  rendererDi: DependencyInjectionContainer;
  mainDi: DependencyInjectionContainer;
}

export function overrideIpcBridge({ rendererDi, mainDi }: OverrideIpcBridgeContainers) {
  const fakeChannelMap = new Map<string, (...args: any[]) => Promise<any>>();
  const fakeEmitter = new EventEmitter();

  rendererDi.override(ipcInvokeInjectable, () => (name, ...args) => {
    if (fakeChannelMap.has(name)) {
      return fakeChannelMap.get(name)(...args);
    } else {
      throw new Error(`Channel ${name} has not been handled`);
    }
  });
  rendererDi.override(broadcastInjectable, () => (channel, ...args) => fakeEmitter.emit(channel, ...args));
  rendererDi.override(ipcRendererOnInjectable, () => (name, listener) => fakeEmitter.on(name, listener));

  mainDi.override(broadcastInjectable, () => (channel, ...args) => fakeEmitter.emit(channel, ...args));
  mainDi.override(ipcMainOnInjectable, () => (name, listener) => fakeEmitter.on(name, listener));
  mainDi.override(ipcHandleInjectable, () => (name, callback) => {
    if (fakeChannelMap.has(name)) {
      throw new Error(`Channel ${name} has already been handled`);
    } else {
      fakeChannelMap.set(name, async (...args: Parameters<typeof callback>) => await callback(...args));
    }
  });
}
