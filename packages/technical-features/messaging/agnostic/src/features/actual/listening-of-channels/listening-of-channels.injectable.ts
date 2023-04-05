import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { enlistMessageChannelListenerInjectionToken } from "../message/enlist-message-channel-listener-injection-token";

import { getStartableStoppable, StartableStoppable } from "@k8slens/startable-stoppable";

import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { IComputedValue, reaction } from "mobx";

import {
  MessageChannel,
  messageChannelListenerInjectionToken,
} from "../message/message-channel-listener-injection-token";
import {
  RequestChannel,
  requestChannelListenerInjectionToken,
} from "../request/request-channel-listener-injection-token";
import { enlistRequestChannelListenerInjectionToken } from "../request/enlist-request-channel-listener-injection-token";

export type ListeningOfChannels = StartableStoppable;
export const listeningOfChannelsInjectionToken = getInjectionToken<ListeningOfChannels>({
  id: "listening-of-channels-injection-token",
});

const listening = <T extends { id: string; channel: MessageChannel<any> | RequestChannel<any, any> }>(
  channelListeners: IComputedValue<T[]>,
  enlistChannelListener: (listener: T) => () => void,
  getId: (listener: T) => string,
) => {
  const listenerDisposers = new Map<string, () => void>();

  const reactionDisposer = reaction(
    () => channelListeners.get(),
    (newValues, oldValues = []) => {
      const addedListeners = newValues.filter((newValue) => !oldValues.some((oldValue) => oldValue.id === newValue.id));

      const removedListeners = oldValues.filter(
        (oldValue) => !newValues.some((newValue) => newValue.id === oldValue.id),
      );

      addedListeners.forEach((listener) => {
        const id = getId(listener);

        if (listenerDisposers.has(id)) {
          throw new Error(`Tried to add listener for channel "${listener.channel.id}" but listener already exists.`);
        }

        const disposer = enlistChannelListener(listener);

        listenerDisposers.set(id, disposer);
      });

      removedListeners.forEach((listener) => {
        const dispose = listenerDisposers.get(getId(listener));

        dispose?.();

        listenerDisposers.delete(getId(listener));
      });
    },

    { fireImmediately: true },
  );

  return () => {
    reactionDisposer();
    listenerDisposers.forEach((dispose) => dispose());
  };
};

const listeningOfChannelsInjectable = getInjectable({
  id: "listening-of-channels",

  instantiate: (di) => {
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);

    const enlistRequestChannelListener = di.inject(enlistRequestChannelListenerInjectionToken);

    const computedInjectMany = di.inject(computedInjectManyInjectable);

    const messageChannelListeners = computedInjectMany(messageChannelListenerInjectionToken);

    const requestChannelListeners = computedInjectMany(requestChannelListenerInjectionToken);

    return getStartableStoppable("listening-of-channels", () => {
      const stopListeningOfMessageChannels = listening(
        messageChannelListeners,
        enlistMessageChannelListener,
        (x) => x.id,
      );

      const stopListeningOfRequestChannels = listening(
        requestChannelListeners,
        enlistRequestChannelListener,
        (x) => x.channel.id,
      );

      return () => {
        stopListeningOfMessageChannels();
        stopListeningOfRequestChannels();
      };
    });
  },

  injectionToken: listeningOfChannelsInjectionToken,
});

export default listeningOfChannelsInjectable;
