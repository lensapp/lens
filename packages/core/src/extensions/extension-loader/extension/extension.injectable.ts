/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { reaction, runInAction } from "mobx";
import { disposer } from "@k8slens/utilities";
import { extensionRegistratorInjectionToken } from "../extension-registrator-injection-token";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";
import type { LegacyLensExtension } from "@k8slens/legacy-extensions";

export interface Extension {
  register: () => void;
  deregister: () => void;
}

const extensionInjectable = getInjectable({
  id: "extension",

  instantiate: (parentDi, instance): Extension => {
    const extensionInjectable = getInjectable({
      id: `extension-${instance.sanitizedExtensionId}`,

      instantiate: (childDi) => {
        const extensionRegistrators = childDi.injectMany(extensionRegistratorInjectionToken);
        const reactionDisposer = disposer();
        const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(childDi);

        return {
          register: () => {
            for (const extensionRegistrator of extensionRegistrators) {
              const injectables = extensionRegistrator(instance);

              if (Array.isArray(injectables)) {
                runInAction(() => {
                  injectableDifferencingRegistrator(injectables);
                });
              } else {
                reactionDisposer.push(reaction(
                  () => injectables.get(),
                  injectableDifferencingRegistrator,
                  {
                    fireImmediately: true,
                  },
                ));
              }
            }
          },

          deregister: () => {
            reactionDisposer();

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
    getInstanceKey: (di, instance: LegacyLensExtension) => instance,
  }),
});

export default extensionInjectable;
