/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import allowedResourcesInjectable from "../cluster-store/allowed-resources.injectable";
import type { KubeResource } from "../rbac";

export type IsAllowedResource = (...resources: KubeResource[]) => boolean;

interface Dependencies {
  allowedResources: IComputedValue<Set<string>>;
}

const isAllowedResource = ({ allowedResources }: Dependencies) => (
  (...resource) => {
    const resources = resource.flat(2);

    if (resources.length === 0) {
      // Fix for the fact that JS's Array.every method is not the same as ∀
      return true;
    }

    const allowed = allowedResources.get();

    return resources.every(resource => allowed.has(resource));
  }
) as IsAllowedResource;

const isAllowedResourceInjectable = getInjectable({
  instantiate: (di) => isAllowedResource({
    allowedResources: di.inject(allowedResourcesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default isAllowedResourceInjectable;
