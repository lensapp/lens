import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { enlistMessageChannelListenerInjectionToken } from "../message/enlist-message-channel-listener-injection-token";
import { getStartableStoppable, StartableStoppable } from "@k8slens/startable-stoppable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { IComputedValue, reaction } from "mobx";

import {
  MessageChannel,
  MessageChannelListener,
  messageChannelListenerInjectionToken,
} from "../message/message-channel-listener-injection-token";
import {
  RequestChannel,
  RequestChannelListener,
  requestChannelListenerInjectionToken,
} from "../request/request-channel-listener-injection-token";
import { enlistRequestChannelListenerInjectionToken } from "../request/enlist-request-channel-listener-injection-token";
import type { Disposer } from "@k8slens/utilities";

export type ListeningOfChannels = StartableStoppable;
export const listeningOfChannelsInjectionToken = getInjectionToken<ListeningOfChannels>({
  id: "listening-of-channels-injection-token",
});

function messageListening<Message>(
  channelListeners: IComputedValue<MessageChannelListener<MessageChannel<Message>>[]>,
  enlistChannelListener: (listener: MessageChannelListener<MessageChannel<Message>>) => Disposer,
): Disposer {
  const listenerDisposers = new Map<string, () => void>();

  const reactionDisposer = reaction(
    () => channelListeners.get(),
    (newValues, oldValues = []) => {
      const addedListeners = newValues.filter((newValue) => !oldValues.some((oldValue) => oldValue.id === newValue.id));

      const removedListeners = oldValues.filter(
        (oldValue) => !newValues.some((newValue) => newValue.id === oldValue.id),
      );

      addedListeners.forEach((listener) => {
        if (listenerDisposers.has(listener.id)) {
          throw new Error(
            `Tried to add listener "${listener.id}" for channel "${listener.channel.id}" but listener with a same ID already exists.`,
          );
        }

        const disposer = enlistChannelListener(listener);

        listenerDisposers.set(listener.id, disposer);
      });

      removedListeners.forEach((listener) => {
        listenerDisposers.get(listener.id)?.();
        listenerDisposers.delete(listener.id);
      });
    },

    { fireImmediately: true },
  );

  return () => {
    reactionDisposer();
    listenerDisposers.forEach((dispose) => dispose());
  };
}

function requestListening<Request, Response>(
  channelListeners: IComputedValue<RequestChannelListener<RequestChannel<Request, Response>>[]>,
  enlistChannelListener: (listener: RequestChannelListener<RequestChannel<Request, Response>>) => Disposer,
): Disposer {
  const listenerDisposers = new Map<string, () => void>();

  const reactionDisposer = reaction(
    () => channelListeners.get(),
    (newValues, oldValues = []) => {
      const addedListeners = newValues.filter(
        (newValue) => !oldValues.some((oldValue) => oldValue.channel.id === newValue.channel.id),
      );

      const removedListeners = oldValues.filter(
        (oldValue) => !newValues.some((newValue) => newValue.channel.id === oldValue.channel.id),
      );

      addedListeners.forEach((listener) => {
        if (listenerDisposers.has(listener.channel.id)) {
          throw new Error(
            `Tried to add request listener for channel "${listener.channel.id}" but listener already exists.`,
          );
        }

        const disposer = enlistChannelListener(listener);

        listenerDisposers.set(listener.channel.id, disposer);
      });

      removedListeners.forEach((listener) => {
        const dispose = listenerDisposers.get(listener.channel.id);

        dispose?.();

        listenerDisposers.delete(listener.channel.id);
      });
    },

    { fireImmediately: true },
  );

  return () => {
    reactionDisposer();
    listenerDisposers.forEach((dispose) => dispose());
  };
}

const listeningOfChannelsInjectable = getInjectable({
  id: "listening-of-channels",

  instantiate: (di) => {
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
    const enlistRequestChannelListener = di.inject(enlistRequestChannelListenerInjectionToken);
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    const messageChannelListeners = computedInjectMany(messageChannelListenerInjectionToken);
    const requestChannelListeners = computedInjectMany(requestChannelListenerInjectionToken);

    return getStartableStoppable("listening-of-channels", () => {
      const stopListeningOfMessageChannels = messageListening(messageChannelListeners, enlistMessageChannelListener);
      const stopListeningOfRequestChannels = requestListening(requestChannelListeners, enlistRequestChannelListener);

      return () => {
        stopListeningOfMessageChannels();
        stopListeningOfRequestChannels();
      };
    });
  },

  injectionToken: listeningOfChannelsInjectionToken,
});

export default listeningOfChannelsInjectable;
