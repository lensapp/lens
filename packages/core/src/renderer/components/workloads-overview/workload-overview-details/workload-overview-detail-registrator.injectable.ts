/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { getRandomIdInjectionToken } from "@k8slens/random";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { workloadOverviewDetailInjectionToken } from "./workload-overview-detail-injection-token";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";

const workloadOverviewDetailRegistratorInjectable = getInjectable({
  id: "workload-overview-detail-registrator",

  instantiate: (di) => {
    const getRandomId = di.inject(getRandomIdInjectionToken);

    return (ext) => {
      const extension = ext as LensRendererExtension;
      const extensionShouldBeEnabledForClusterFrame = di.inject(extensionShouldBeEnabledForClusterFrameInjectable, extension);

      return extension.kubeWorkloadsOverviewItems.map((registration) => getInjectable({
        id: `workload-overview-detail-from-${extension.sanitizedExtensionId}-${getRandomId()}`,

        instantiate: () => ({
          Component: registration.components.Details,

          enabled: computed(() => {
            if (!extensionShouldBeEnabledForClusterFrame.value.get()) {
              return false;
            }

            return registration.visible ? registration.visible.get() : true;
          }),

          orderNumber: 0.5 + (registration.priority ? 100 - registration.priority : 50),
        }),

        injectionToken: workloadOverviewDetailInjectionToken,
      }));
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default workloadOverviewDetailRegistratorInjectable;
