/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Disposer } from "../disposer";
import type { MessageChannel, MessageChannelListener } from "./message-channel-listener-injection-token";

export type EnlistMessageChannelListener = <T>(listener: MessageChannelListener<MessageChannel<T>>) => Disposer;

export const enlistMessageChannelListenerInjectionToken = getInjectionToken<EnlistMessageChannelListener>({
  id: "enlist-message-channel-listener",
});

export interface MessageChannelEmitter {
  on(channel: string, listener: (event: Event, ...args: any[]) => void): void;
  off(channel: string, listener: (event: Event, ...args: any[]) => void): void;
}

export const enlistMessageChannelListenerFor = (emitter: MessageChannelEmitter) => (
  <T>({ channel, handler }: MessageChannelListener<MessageChannel<T>>) => {
    const nativeOnCallback = (_: Event, message: T) => {
      handler(message);
    };

    emitter.on(channel.id, nativeOnCallback);

    return () => {
      emitter.off(channel.id, nativeOnCallback);
    };
  }
);
