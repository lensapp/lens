/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter, sortBy as sortByWithBadTyping } from "lodash/fp";
import { computed } from "mobx";
import { Workload, workloadInjectionToken } from "./workload-injection-token";
import isAllowedResourceInjectable from "../../../../common/utils/is-allowed-resource.injectable";

const sortBy =
  (propertyPath: string) =>
  <Collection extends object>(collection: Collection[]) =>
      sortByWithBadTyping(propertyPath, collection);

const workloadsInjectable = getInjectable({
  id: "workloads",

  instantiate: (di) => {
    const workloads = di.injectMany(workloadInjectionToken);

    const isAllowedResource = (resourceName: string) =>
      di.inject(isAllowedResourceInjectable, resourceName);

    return computed(() =>
      pipeline(
        workloads,

        filter((workload: Workload) => {
          const isAllowed = isAllowedResource(workload.resourceName);

          return isAllowed.get();
        }),

        sortBy("orderNumber"),
      ),
    );
  },
});

export default workloadsInjectable;
