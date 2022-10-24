/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { map } from "lodash/fp";
import { extensionRegistratorInjectionToken } from "../../extensions/extension-loader/extension-registrator-injection-token";
import type { ExtensionRegistrator } from "../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import { clusterModalsInjectionToken } from "./cluster-modals-injection-token";

const clusterModalsRegistratorInjectable = getInjectable({
  id: "cluster-modals-registrator",

  instantiate: (): ExtensionRegistrator => {
    return (ext) => {
      const extension = ext as LensRendererExtension;

      return pipeline(
        extension.clusterModals,

        map((modal) => {
          return getInjectable({
            id: modal.id,
            injectionToken: clusterModalsInjectionToken,
            instantiate: () => ({
              id: `${modal.id}-id`,
              visible: modal.visible,
              Component: modal.Component,
            }),
          });
        }),
      );
    };
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default clusterModalsRegistratorInjectable;
