import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { filter, groupBy, nth, map, toPairs } from "lodash/fp";
import { reaction } from "mobx";
import { computedChannelObserverInjectionToken } from "./computed-channel.injectable";

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
              map(nth(0)),
            );

            if (duplicateObserverChannelIds.length) {
              throw new Error(
                `Tried to register duplicate channel observer for channels "${duplicateObserverChannelIds.join(
                  '", "',
                )}"`,
              );
            }
          },
        );
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});
