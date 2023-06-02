/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { map } from "lodash/fp";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { ExtensionRegistrator } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";

const clusterFrameComponentRegistratorInjectable = getInjectable({
  id: "cluster-frame-component-registrator",

  instantiate: (): ExtensionRegistrator => {
    return (ext) => {
      const extension = ext as LensRendererExtension;

      return pipeline(
        extension.clusterFrameComponents,

        map((clusterFrameComponentRegistration) => {
          const id = `${extension.sanitizedExtensionId}-${clusterFrameComponentRegistration.id}`;

          return getInjectable({
            id,
            injectionToken: clusterFrameChildComponentInjectionToken,
            instantiate: () => ({
              id,
              shouldRender: clusterFrameComponentRegistration.shouldRender,
              Component: clusterFrameComponentRegistration.Component,
            }),
          });
        }),
      );
    };
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default clusterFrameComponentRegistratorInjectable;
