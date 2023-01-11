/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubernetesCluster } from "../../common/catalog-entities";
import type { LensRendererExtension } from "../lens-renderer-extension";

interface ExtensionIsEnabledForCluster {
  extension: LensRendererExtension;
  cluster: KubernetesCluster;
}

const extensionIsEnabledForClusterInjectable = getInjectable({
  id: "extension-is-enabled-for-cluster",

  instantiate: async (
    di,
    { extension, cluster }: ExtensionIsEnabledForCluster,
  ) => (await extension.isEnabledForCluster(cluster)) as boolean,

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (
      di,
      { extension, cluster }: ExtensionIsEnabledForCluster,
    ) => `${extension.sanitizedExtensionId}-${cluster.getId()}`,
  }),
});

export default extensionIsEnabledForClusterInjectable;
