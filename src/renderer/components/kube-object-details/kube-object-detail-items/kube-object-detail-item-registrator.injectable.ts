/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getRandomIdInjectable from "../../../../common/utils/get-random-id.injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { kubeObjectDetailItemInjectionToken } from "./kube-object-detail-item-injection-token";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import currentKubeObjectInDetailsInjectable from "../current-kube-object-in-details.injectable";
import {
  kubeObjectMatchesToKindAndApiVersion,
} from "./kube-object-matches-to-kind-and-api-version";

const kubeObjectDetailItemRegistratorInjectable = getInjectable({
  id: "kube-object-detail-item-registrator",

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

      return extension.kubeObjectDetailItems.map((registration) => {
        const id = `kube-object-detail-item-registration-from-${
          extension.sanitizedExtensionId
        }-${getRandomId()}`;

        const isRelevantKubeObject = kubeObjectMatchesToKindAndApiVersion(
          registration.kind,
          registration.apiVersions,
        );

        return getInjectable({
          id,

          instantiate: (di) => {
            const kubeObject = di.inject(
              currentKubeObjectInDetailsInjectable,
            );

            return {
              kind: registration.kind,
              apiVersions: registration.apiVersions,
              Component: registration.components.Details,

              enabled: computed(
                () =>
                  extensionShouldBeEnabledForClusterFrame.value.get() &&
                  isRelevantKubeObject(kubeObject.get()),
              ),

              orderNumber: 300 - (registration.priority || 50),
            };
          },

          injectionToken: kubeObjectDetailItemInjectionToken,
        });
      });
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default kubeObjectDetailItemRegistratorInjectable;
