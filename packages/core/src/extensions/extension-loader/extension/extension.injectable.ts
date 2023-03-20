/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { reaction, runInAction } from "mobx";
import { disposer } from "@k8slens/utilities";
import type { LensExtension } from "../../lens-extension";
import { extensionRegistratorInjectionToken } from "../extension-registrator-injection-token";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";

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
        const reactionDisposer = disposer();
        const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(childDi);

        return {
          register: () => {
            extensionRegistrators.forEach((getInjectablesOfExtension) => {
              const injectables = getInjectablesOfExtension(instance);

              reactionDisposer.push(
                // injectables is either an array or a computed array, in which case
                // we need to update the registered injectables with a reaction every time they change
                reaction(
                  () => Array.isArray(injectables) ? injectables : injectables.get(),
                  injectableDifferencingRegistrator,
                  {
                    fireImmediately: true,
                  },
                ));
            });
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
    getInstanceKey: (di, instance: LensExtension) => instance,
  }),
});

export default extensionInjectable;
