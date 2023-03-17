import { reaction } from "mobx";

import type { MessageChannel } from "../message/message-channel-listener-injection-token";
import { getMessageChannelListenerInjectable } from "../message/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../message/message-to-channel-injection-token.no-coverage";
import type { JsonPrimitive } from "type-fest";
import { computedChannelObserverInjectionToken } from "./computed-channel.injectable";

export type JsonifiableObject = { [Key in string]?: Jsonifiable } | { toJSON: () => Jsonifiable };
export type JsonifiableArray = readonly Jsonifiable[];
export type Jsonifiable = JsonPrimitive | JsonifiableObject | JsonifiableArray;

export type ComputedChannelAdminMessage = {
  channelId: string;
  status: "became-observed" | "became-unobserved";
};


export const computedChannelAdministrationChannel: MessageChannel<ComputedChannelAdminMessage> = {
  id: "computed-channel-administration-channel",
};

export const computedChannelAdministrationListenerInjectable = getMessageChannelListenerInjectable({
  id: "computed-channel-administration",
  getHandler: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    const disposersByChannelId = new Map<string, () => void>();

    return (message) => {
      if (message.status === "became-observed") {
        const result = di
          .injectMany(computedChannelObserverInjectionToken)
          .find((channelObserver) => channelObserver.channel.id === message.channelId);

        if (result === undefined) {
          return;
        }

        const disposer = reaction(
          () => result.observer.get(),
          (observed) =>
            sendMessageToChannel(
              {
                id: message.channelId,
              },

              observed,
            ),
          {
            fireImmediately: true,
          },
        );

        disposersByChannelId.set(message.channelId, disposer);
      } else {
        const disposer = disposersByChannelId.get(message.channelId);

        disposer?.();
      }
    };
  },

  channel: computedChannelAdministrationChannel,
});
