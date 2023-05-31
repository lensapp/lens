/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { getRandomIdInjectionToken } from "@k8slens/random";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { kubeObjectMenuItemInjectionToken } from "./kube-object-menu-item-injection-token";
import { computed } from "mobx";

const kubeObjectMenuItemRegistratorInjectable = getInjectable({
  id: "kube-object-menu-item-registrator",

  instantiate: (di) => {
    const getRandomId = di.inject(getRandomIdInjectionToken);

    const getExtensionShouldBeEnabledForClusterFrame = (
      extension: LensRendererExtension,
    ) =>
      di.inject(extensionShouldBeEnabledForClusterFrameInjectable, extension);

    return (ext) => {
      const extension = ext as LensRendererExtension;

      const extensionShouldBeEnabledForClusterFrame =
        getExtensionShouldBeEnabledForClusterFrame(extension);

      return extension.kubeObjectMenuItems.map((registration) => {
        const id = `kube-object-menu-item-registration-from-${
          extension.sanitizedExtensionId
        }-${getRandomId()}`;

        return getInjectable({
          id,

          instantiate: () => ({
            kind: registration.kind,
            apiVersions: registration.apiVersions,
            Component: registration.components.MenuItem,

            enabled: computed(() => {
              if (!extensionShouldBeEnabledForClusterFrame.value.get()) {
                return false;
              }

              return registration.visible ? registration.visible.get() : true;
            }),

            orderNumber: 100,
          }),

          injectionToken: kubeObjectMenuItemInjectionToken,
        });
      });
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default kubeObjectMenuItemRegistratorInjectable;
