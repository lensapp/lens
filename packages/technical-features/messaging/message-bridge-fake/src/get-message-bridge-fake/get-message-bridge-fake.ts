import type { DiContainer } from "@ogre-tools/injectable";
import type {
  MessageChannel,
  MessageChannelHandler,
  MessageChannelListener,
  RequestChannel,
  RequestChannelHandler,
} from "@k8slens/messaging";

import {
  enlistMessageChannelListenerInjectionToken,
  enlistRequestChannelListenerInjectionToken,
  RequestFromChannel,
  requestFromChannelInjectionToken,
  sendMessageToChannelInjectionToken,
} from "@k8slens/messaging";

import { pipeline } from "@ogre-tools/fp";
import { filter, map } from "lodash/fp";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";

export type MessageBridgeFake = {
  involve: (...dis: DiContainer[]) => void;
  messagePropagation: () => Promise<void>;
  messagePropagationRecursive: (callback: () => any) => any;
  setAsync: (value: boolean) => void;
};

type MessageHandlers = Set<MessageChannelHandler<MessageChannel<any>>>;

const overrideMessaging = ({
  di,
  messageListenersByDi,
  messagePropagationBuffer,
  getAsyncModeStatus,
}: {
  di: DiContainer;

  messageListenersByDi: Map<DiContainer, Map<string, MessageHandlers>>;

  messagePropagationBuffer: Set<{ resolve: () => Promise<void> }>;

  getAsyncModeStatus: () => boolean;
}) => {
  const messageHandlersByChannel = new Map<string, MessageHandlers>();

  messageListenersByDi.set(di, messageHandlersByChannel);

  di.override(sendMessageToChannelInjectionToken, () => (channel, message) => {
    const allOtherDis = [...messageListenersByDi.keys()].filter((x) => x !== di);

    allOtherDis.forEach((otherDi) => {
      const listeners = messageListenersByDi.get(otherDi);

      const handlersForChannel = listeners?.get(channel.id);

      if (!handlersForChannel) {
        return;
      }

      if (getAsyncModeStatus()) {
        const resolvableHandlePromise = asyncFn();

        resolvableHandlePromise().then(() => {
          handlersForChannel.forEach((handler) => handler(message, { frameId: 42, processId: 42 }));
        });

        messagePropagationBuffer.add(resolvableHandlePromise);
      } else {
        handlersForChannel.forEach((handler) => handler(message, { frameId: 42, processId: 42 }));
      }
    });
  });

  di.override(
    enlistMessageChannelListenerInjectionToken,
    () =>
      <T>(listener: MessageChannelListener<MessageChannel<T>>) => {
        if (!messageHandlersByChannel.has(listener.channel.id)) {
          messageHandlersByChannel.set(listener.channel.id, new Set());
        }

        const handlerSet = messageHandlersByChannel.get(listener.channel.id);

        handlerSet?.add(listener.handler);

        return () => {
          handlerSet?.delete(listener.handler);
        };
      },
  );
};

type RequestHandlers = Set<RequestChannelHandler<RequestChannel<any, any>>>;

const overrideRequesting = ({
  di,
  requestListenersByDi,
}: {
  di: DiContainer;

  requestListenersByDi: Map<DiContainer, Map<string, RequestHandlers>>;
}) => {
  const requestHandlersByChannel = new Map<string, RequestHandlers>();

  requestListenersByDi.set(di, requestHandlersByChannel);

  di.override(
    requestFromChannelInjectionToken,
    () =>
      (async (channel, request) =>
        pipeline(
          [...requestListenersByDi.values()],
          map((listenersByChannel) => listenersByChannel?.get(channel.id)),
          filter((x) => !!x),

          (channelSpecificListeners) => {
            if (channelSpecificListeners.length === 0) {
              throw new Error(
                `Tried to make a request but no listeners for channel "${channel.id}" was discovered in any DIs`,
              );
            }

            if (channelSpecificListeners.length > 1) {
              throw new Error(
                `Tried to make a request but multiple listeners were discovered for channel "${channel.id}" in multiple DIs.`,
              );
            }

            const listeners = channelSpecificListeners[0];

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [handler] = listeners!;

            return handler;
          },

          async (handler) => handler(request),
        )) as RequestFromChannel,
  );

  di.override(enlistRequestChannelListenerInjectionToken, () => (listener) => {
    if (!requestHandlersByChannel.has(listener.channel.id)) {
      requestHandlersByChannel.set(listener.channel.id, new Set());
    }

    const handlerSet = requestHandlersByChannel.get(listener.channel.id);

    handlerSet?.add(listener.handler);

    return () => {
      handlerSet?.delete(listener.handler);
    };
  });
};

export const getMessageBridgeFake = (): MessageBridgeFake => {
  const messageListenersByDi = new Map<DiContainer, Map<string, MessageHandlers>>();
  const requestListenersByDi = new Map<DiContainer, Map<string, RequestHandlers>>();

  const messagePropagationBuffer = new Set<AsyncFnMock<() => void>>();

  const messagePropagation = async (wrapper: (callback: any) => any = (callback) => callback()) => {
    const oldMessages = [...messagePropagationBuffer.values()];

    messagePropagationBuffer.clear();
    await Promise.all(oldMessages.map((x) => wrapper(x.resolve)));
  };

  const messagePropagationRecursive = async (wrapper = (callback: () => any) => callback()) => {
    while (messagePropagationBuffer.size) {
      await messagePropagation(wrapper);
    }
  };

  let asyncModeStatus = false;
  const getAsyncModeStatus = () => asyncModeStatus;

  return {
    involve: (...dis: DiContainer[]) => {
      dis.forEach((di) => {
        overrideRequesting({ di, requestListenersByDi });

        overrideMessaging({
          di,
          messageListenersByDi,
          messagePropagationBuffer,
          getAsyncModeStatus,
        });
      });
    },

    messagePropagation,

    messagePropagationRecursive,

    setAsync: (value) => {
      asyncModeStatus = value;
    },
  };
};
