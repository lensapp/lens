/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { EventEmitter } from "events";
import { ipcMain } from "electron";
import logger from "../../main/logger";
import type { Disposer } from "../utils";
import { ipcMainHandle } from "./ipc";

export type ListenerEvent<EM extends EventEmitter> = Parameters<Parameters<EM["on"]>[1]>[0];
export type ListVerifier<T extends any[]> = (args: unknown[]) => args is T;
export type Rest<T> = T extends [any, ...infer R] ? R : [];

/**
 * Adds a listener to `source` that waits for the first IPC message with the correct
 * argument data is sent.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onceCorrect<
  IPC extends EventEmitter,
  Listener extends (event: ListenerEvent<IPC>, ...args: any[]) => any,
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: IPC,
  channel: string,
  listener: Listener,
  verifier: ListVerifier<Rest<Parameters<Listener>>>,
}): void {
  function wrappedListener(event: ListenerEvent<IPC>, ...args: unknown[]): void {
    if (verifier(args)) {
      source.removeListener(channel, wrappedListener); // remove immediately

      (async () => await listener(event, ...args))() // might return a promise, or throw, or reject
        .catch((error: any) => logger.error("[IPC]: channel once handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was emitted with invalid data", { channel, args });
    }
  }

  source.on(channel, wrappedListener);
}

/**
 * Adds a listener to `source` that checks to verify the arguments before calling the handler.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onCorrect<
  IPC extends EventEmitter,
  Listener extends (event: ListenerEvent<IPC>, ...args: any[]) => any,
>({
  source,
  channel,
  listener,
  verifier,
}: {
  source: IPC,
  channel: string,
  listener: Listener,
  verifier: ListVerifier<Rest<Parameters<Listener>>>,
}): Disposer {
  function wrappedListener(event: ListenerEvent<IPC>, ...args: unknown[]) {
    if (verifier(args)) {
      (async () => await listener(event, ...args))() // might return a promise, or throw, or reject
        .catch(error => logger.error("[IPC]: channel on handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was emitted with invalid data", { channel, args });
    }
  }

  source.on(channel, wrappedListener);

  return () => source.off(channel, wrappedListener);
}

export function handleCorrect<
  Handler extends (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any,
>({
  channel,
  handler,
  verifier,
}: {
  channel: string,
  handler: Handler,
  verifier: ListVerifier<Rest<Parameters<Handler>>>,
}): Disposer {
  function wrappedHandler(event: Electron.IpcMainInvokeEvent, ...args: unknown[]): ReturnType<Handler> {
    if (verifier(args)) {
      return handler(event, ...args);
    }

    throw new TypeError(`Invalid args for invoke on channel: ${channel}`);
  }

  ipcMainHandle(channel, wrappedHandler);

  return () => ipcMain.removeHandler(channel);
}
