/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";
import { kubeObjectStatusTextInjectionToken } from "./kube-object-status-text-injection-token";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { computed } from "mobx";

const kubeObjectStatusTextRegistratorInjectable = getInjectable({
  id: "kube-object-status-text-registrator",

  instantiate: (di) => {
    const getRandomId = di.inject(getRandomIdInjectable);

    return (ext) => {
      const extension = ext as LensRendererExtension;
      const extensionShouldBeEnabledForClusterFrame = di.inject(extensionShouldBeEnabledForClusterFrameInjectable, extension);

      return extension.kubeObjectStatusTexts.map(({
        visible = computed(() => true),
        ...registration
      }) => {
        const id = `kube-object-status-text-registration-from-${extension.sanitizedExtensionId}-${getRandomId()}`;

        return getInjectable({
          id,
          instantiate: () => ({
            ...registration,
            enabled: computed(() => (
              extensionShouldBeEnabledForClusterFrame.value.get()
              && visible.get()
            )),
          }),

          injectionToken: kubeObjectStatusTextInjectionToken,
        });
      });
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default kubeObjectStatusTextRegistratorInjectable;
