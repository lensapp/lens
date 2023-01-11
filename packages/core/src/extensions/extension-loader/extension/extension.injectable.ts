/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { difference, find, map } from "lodash";
import { reaction, runInAction } from "mobx";
import { disposer } from "../../../common/utils/disposer";
import type { LensExtension } from "../../lens-extension";
import { extensionRegistratorInjectionToken } from "../extension-registrator-injection-token";

export interface Extension {
  register: () => void;
  deregister: () => void;
}

const idsToInjectables = (ids: string[], injectables: Injectable<any, any, any>[]) => ids.map(id => {
  const injectable = find(injectables, { id });

  if (!injectable) {
    throw new Error(`Injectable ${id} not found`);
  }

  return injectable;
});

const extensionInjectable = getInjectable({
  id: "extension",

  instantiate: (parentDi, instance: LensExtension): Extension => {
    const extensionInjectable = getInjectable({
      id: `extension-${instance.sanitizedExtensionId}`,

      instantiate: (childDi) => {
        const extensionRegistrators = childDi.injectMany(extensionRegistratorInjectionToken);
        const reactionDisposer = disposer();

        return {
          register: () => {
            extensionRegistrators.forEach((getInjectablesOfExtension) => {
              const injectables = getInjectablesOfExtension(instance);

              reactionDisposer.push(
                // injectables is either an array or a computed array, in which case
                // we need to update the registered injectables with a reaction every time they change 
                reaction(
                  () => Array.isArray(injectables) ? injectables : injectables.get(),
                  (currentInjectables, previousInjectables = []) => {
                    // Register new injectables and deregister removed injectables by id
                    const currentIds = map(currentInjectables, "id");
                    const previousIds = map(previousInjectables, "id");
                    const idsToAdd = difference(currentIds, previousIds);
                    const idsToRemove = previousIds.filter(previousId => !currentIds.includes(previousId));

                    if (idsToRemove.length > 0) {
                      childDi.deregister(...idsToInjectables(idsToRemove, previousInjectables));
                    }

                    if (idsToAdd.length > 0) {
                      childDi.register(...idsToInjectables(idsToAdd, currentInjectables));
                    }
                  }, {
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
