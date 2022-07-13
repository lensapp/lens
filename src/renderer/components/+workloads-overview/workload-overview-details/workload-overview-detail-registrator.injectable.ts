/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getRandomIdInjectable from "../../../../common/utils/get-random-id.injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { workloadOverviewDetailInjectionToken } from "./workload-overview-detail-injection-token";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";

const workloadOverviewDetailRegistratorInjectable = getInjectable({
  id: "workload-overview-detail-registrator",

  instantiate: (di) => {
    const getRandomId = di.inject(getRandomIdInjectable);

    const getExtensionShouldBeEnabledForClusterFrame = (
      extension: LensRendererExtension,
    ) =>
      di.inject(extensionShouldBeEnabledForClusterFrameInjectable, extension);

    return (ext) => {
      const extension = ext as LensRendererExtension;

      const extensionShouldBeEnabledForClusterFrame =
        getExtensionShouldBeEnabledForClusterFrame(extension);

      return extension.kubeWorkloadsOverviewItems.map((registration) => {
        const id = `workload-overview-detail-from-${
          extension.sanitizedExtensionId
        }-${getRandomId()}`;

        return getInjectable({
          id,

          instantiate: () => ({
            Component: registration.components.Details,

            enabled: computed(() =>
              extensionShouldBeEnabledForClusterFrame.value.get(),
            ),

            orderNumber:
              0.5 + (registration.priority ? 100 - registration.priority : 50),
          }),

          injectionToken: workloadOverviewDetailInjectionToken,
        });
      });
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default workloadOverviewDetailRegistratorInjectable;
