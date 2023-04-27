import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import { iter } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { reaction } from "mobx";
import { computedChannelObserverInjectionToken } from "./computed-channel.injectable";

export const duplicateChannelObserverGuardInjectable = getInjectable({
  id: "duplicate-channel-observer-guard",

  instantiate: (di) => ({
    run: () => {
      const computedInjectMany = di.inject(computedInjectManyInjectable);
      const computedObservers = computedInjectMany(computedChannelObserverInjectionToken);

      reaction(
        () => computedObservers.get(),
        (observers) => {
          const observersByChannelId = iter
            .chain(observers.values())
            .map((observer) => [observer.channel.id, observer] as const)
            .groupIntoMap();
          const duplicateIds = iter
            .chain(observersByChannelId.entries())
            .filter(([, channelObservers]) => channelObservers.length > 1)
            .map(([id]) => id)
            .toArray();

          if (duplicateIds.length) {
            throw new Error(`Tried to register duplicate channel observer for channels "${duplicateIds.join('", "')}"`);
          }
        },
      );
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});
