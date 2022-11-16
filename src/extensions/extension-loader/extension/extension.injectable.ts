/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IReactionDisposer } from "mobx";
import { reaction, runInAction } from "mobx";
import type { LensExtension } from "../../lens-extension";
import { extensionRegistratorInjectionToken } from "../extension-registrator-injection-token";

export interface Extension {
  register: () => void;
  deregister: () => void;
}

const extensionInjectable = getInjectable({
  id: "extension",

  instantiate: (parentDi, instance: LensExtension): Extension => {
    const extensionInjectable = getInjectable({
      id: `extension-${instance.sanitizedExtensionId}`,

      instantiate: (childDi) => {
        const extensionRegistrators = childDi.injectMany(extensionRegistratorInjectionToken);
        const disposers: IReactionDisposer[] = [];

        return {
          register: () => {
            extensionRegistrators.forEach((getInjectablesOfExtension) => {
              const injectables = getInjectablesOfExtension(instance);

              disposers.push(
                // injectables is either an array or a computed array, in which case
                // we need to update the registered injectables with a reaction every time they change 
                reaction(
                  () => Array.isArray(injectables) ? injectables : injectables.get(),
                  (currentInjectables, previousInjectables) => {
                    // On the second reaction remove the previously registered injectables to avoid duplicate injectables
                    if (previousInjectables) {
                      childDi.deregister(...previousInjectables);
                    }

                    childDi.register(...currentInjectables);
                  }, {
                    fireImmediately: true,
                  },
                ));
            });
          },

          deregister: () => {
            disposers.forEach(dispose => {
              dispose();
            });

            disposers.length = 0;

            runInAction(() => {
              parentDi.deregister(extensionInjectable);
            });
          },
        };
      },
    });

    runInAction(() => {
      parentDi.register(extensionInjectable);
    });

    return parentDi.inject(extensionInjectable);
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_di, instance: LensExtension) => instance,
  }),
});

export default extensionInjectable;
