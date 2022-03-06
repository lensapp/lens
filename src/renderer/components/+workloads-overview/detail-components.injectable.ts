/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { OverviewStatuses } from "./overview-statuses";
import { WorkloadEvents } from "../../initializers/workload-events";
import { orderBy } from "lodash/fp";
import type { WorkloadsOverviewDetailRegistration } from "./workloads-overview-detail-registration";

const detailComponentsInjectable = getInjectable({
  id: "workload-detail-components",

  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const extensionRegistrations = extensions
        .get()
        .flatMap((extension) => extension.kubeWorkloadsOverviewItems);

      const allRegistrations = [
        ...coreRegistrations,
        ...extensionRegistrations,
      ];

      return getRegistrationsInPriorityOrder(allRegistrations).map(
        (item) => item.components.Details,
      );
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

const coreRegistrations = [
  {
    components: {
      Details: OverviewStatuses,
    },
  },
  {
    priority: 5,
    components: {
      Details: WorkloadEvents,
    },
  },
];

const toRegistrationWithDefaultPriority = ({
  priority = 50,
  ...rest
}: WorkloadsOverviewDetailRegistration) => ({
  priority,
  ...rest,
});

const getRegistrationsInPriorityOrder = (
  allRegistrations: WorkloadsOverviewDetailRegistration[],
) =>
  orderBy(
    "priority",
    "desc",

    allRegistrations.map(toRegistrationWithDefaultPriority),
  );

export default detailComponentsInjectable;
