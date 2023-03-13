import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

import {
  _getGlobalState,
  computed,
  IComputedValue,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  reaction,
  runInAction,
} from "mobx";

import type { MessageChannel } from "../message/message-channel-listener-injection-token";
import { getMessageChannelListenerInjectable } from "../message/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../message/message-to-channel-injection-token.no-coverage";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import { pipeline } from "@ogre-tools/fp";
import { filter, groupBy, map, nth, toPairs } from "lodash/fp";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import type { JsonPrimitive } from "type-fest";

export type JsonifiableObject = {[Key in string]?: Jsonifiable} | {toJSON: () => Jsonifiable};
export type JsonifiableArray = readonly Jsonifiable[];
export type Jsonifiable = JsonPrimitive | JsonifiableObject | JsonifiableArray

export type ComputedChannelFactory = <T>(
  channel: MessageChannel<T>,
  pendingValue: T
) => IComputedValue<T>;

export const computedChannelInjectionToken =
  getInjectionToken<ComputedChannelFactory>({
    id: "computed-channel-injection-token",
  });

export type ChannelObserver<T extends Jsonifiable> = {
  channel: MessageChannel<T>;
  observer: IComputedValue<T>;
};
export type ComputedChannelAdminMessage = {
  channelId: string;
  status: "became-observed" | "became-unobserved";
};

export const computedChannelObserverInjectionToken = getInjectionToken<
  ChannelObserver<Jsonifiable>
>({
  id: "computed-channel-observer",
});

const computedChannelInjectable = getInjectable({
  id: "computed-channel",

  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return ((channel, pendingValue) => {
      const observableValue = observable.box(pendingValue);

      const computedValue = computed(() => {
        const { trackingDerivation } = _getGlobalState();

        const contextIsReactive = !!trackingDerivation;

        if (!contextIsReactive) {
          throw new Error(
            `Tried to access value of computed channel "${channel.id}" outside of reactive context. This is not possible, as the value is acquired asynchronously sometime *after* being observed. Not respecting that, the value could be stale.`
          );
        }

        return observableValue.get();
      });

      const valueReceiverInjectable = getMessageChannelListenerInjectable({
        id: `computed-channel-value-receiver-for-${channel.id}`,
        channel,

        getHandler: () => (message) => {
          runInAction(() => {
            observableValue.set(message);
          });
        },
      });

      runInAction(() => {
        di.register(valueReceiverInjectable);
      });

      onBecomeObserved(computedValue, () => {
        runInAction(() => {
          observableValue.set(pendingValue);
        });

        sendMessageToChannel(computedChannelAdministrationChannel, {
          channelId: channel.id,
          status: "became-observed",
        });
      });

      onBecomeUnobserved(computedValue, () => {
        runInAction(() => {
          observableValue.set(pendingValue);
        });

        sendMessageToChannel(computedChannelAdministrationChannel, {
          channelId: channel.id,
          status: "became-unobserved",
        });
      });

      return computedValue;
    }) as ComputedChannelFactory;
  },

  injectionToken: computedChannelInjectionToken,
});

export const duplicateChannelObserverGuardInjectable = getInjectable({
  id: "duplicate-channel-observer-guard",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return {
      run: () => {
        reaction(
          () => computedInjectMany(computedChannelObserverInjectionToken).get(),
          (observers) => {
            const duplicateObserverChannelIds = pipeline(
              observers,
              groupBy((observer) => observer.channel.id),
              toPairs,
              filter(([, channelObservers]) => channelObservers.length > 1),
              map(nth(0))
            );

            if (duplicateObserverChannelIds.length) {
              throw new Error(
                `Tried to register duplicate channel observer for channels "${duplicateObserverChannelIds.join(
                  '", "'
                )}"`
              );
            }
          }
        );
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export const computedChannelAdministrationChannel: MessageChannel<ComputedChannelAdminMessage> =
  {
    id: "computed-channel-administration-channel",
  };

export const computedChannelAdministrationListenerInjectable =
  getMessageChannelListenerInjectable({
    id: "computed-channel-administration",
    getHandler: (di) => {
      const sendMessageToChannel = di.inject(
        sendMessageToChannelInjectionToken
      );

      const disposersByChannelId = new Map<string, () => void>();

      return (message) => {
        if (message.status === "became-observed") {
          const result = di
            .injectMany(computedChannelObserverInjectionToken)
            .find(
              (channelObserver) =>
                channelObserver.channel.id === message.channelId
            );

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

                observed
              ),
            {
              fireImmediately: true,
            }
          );

          disposersByChannelId.set(message.channelId, disposer);
        } else {
          const disposer = disposersByChannelId.get(message.channelId);

          disposer!();
        }
      };
    },

    channel: computedChannelAdministrationChannel,
  });

export default computedChannelInjectable;
