import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

import {
  _getGlobalState,
  computed,
  IComputedValue,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  runInAction,
} from "mobx";

import type { MessageChannel } from "../message/message-channel-listener-injection-token";
import { getMessageChannelListenerInjectable } from "../message/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../message/message-to-channel-injection-token.no-coverage";
import type { JsonPrimitive } from "type-fest";
import { computedChannelAdministrationChannel } from "./computed-channel-administration-channel.injectable";

export type JsonifiableObject = { [Key in string]?: Jsonifiable } | { toJSON: () => Jsonifiable };
export type JsonifiableArray = readonly Jsonifiable[];
export type Jsonifiable = JsonPrimitive | JsonifiableObject | JsonifiableArray;

export type ComputedChannelFactory = <T>(
  channel: MessageChannel<T>,
  pendingValue: T,
) => IComputedValue<T>;

export const computedChannelInjectionToken = getInjectionToken<ComputedChannelFactory>({
  id: "computed-channel-injection-token",
});

export type ChannelObserver<T extends Jsonifiable> = {
  channel: MessageChannel<T>;
  observer: IComputedValue<T>;
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
            `Tried to access value of computed channel "${channel.id}" outside of reactive context. This is not possible, as the value is acquired asynchronously sometime *after* being observed. Not respecting that, the value could be stale.`,
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

export default computedChannelInjectable;
