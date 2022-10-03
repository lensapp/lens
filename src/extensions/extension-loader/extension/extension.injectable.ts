/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
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

        return {
          register: () => {
            const injectables = extensionRegistrators.flatMap((getInjectablesOfExtension) =>
              getInjectablesOfExtension(instance),
            );

            runInAction(() => {
              childDi.register(...injectables);
            });
          },

          deregister: () => {
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
    getInstanceKey: (di, instance: LensExtension) => instance,
  }),
});

export default extensionInjectable;
