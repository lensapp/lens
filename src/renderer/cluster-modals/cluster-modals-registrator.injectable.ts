/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExtensionRegistrator } from "../../extensions/extension-loader/extension-registrator-injection-token";
import { extensionRegistratorInjectionToken } from "../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

const clusterModalsRegistratorInjectable = getInjectable({
  id: "cluster-modals-registrator",

  instantiate: (): ExtensionRegistrator => {
    return (ext) => {
      const extension = ext as LensRendererExtension;

      return extension.clusterModals.map(registration => {
        return getInjectable({
          id: registration.id,

          instantiate: () => ({
            Component: registration.Component,
            visible: registration.visible,
          }),
        });
      });
    };
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default clusterModalsRegistratorInjectable;
