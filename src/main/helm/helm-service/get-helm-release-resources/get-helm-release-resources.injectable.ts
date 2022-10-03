/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import callForKubeResourcesByManifestInjectable from "./call-for-kube-resources-by-manifest/call-for-kube-resources-by-manifest.injectable";
import { groupBy, map } from "lodash/fp";
import type { JsonObject } from "type-fest";
import { pipeline } from "@ogre-tools/fp";
import callForHelmManifestInjectable from "./call-for-helm-manifest/call-for-helm-manifest.injectable";

export type GetHelmReleaseResources = (
  name: string,
  namespace: string,
  kubeconfigPath: string,
  kubectlPath: string
) => Promise<JsonObject[]>;

const getHelmReleaseResourcesInjectable = getInjectable({
  id: "get-helm-release-resources",

  instantiate: (di): GetHelmReleaseResources => {
    const callForHelmManifest = di.inject(callForHelmManifestInjectable);
    const callForKubeResourcesByManifest = di.inject(callForKubeResourcesByManifestInjectable);

    return async (name, namespace, kubeconfigPath, kubectlPath) => {
      const result = await callForHelmManifest(name, namespace, kubeconfigPath);

      if (!result.callWasSuccessful) {
        throw new Error(result.error);
      }

      const results = await pipeline(
        result.response,

        groupBy((item) => item.metadata.namespace || namespace),

        (x) => Object.entries(x),

        map(([namespace, manifest]) =>
          callForKubeResourcesByManifest(namespace, kubeconfigPath, kubectlPath, manifest),
        ),

        promises => Promise.all(promises),
      );

      return results.flat(1);
    };
  },
});

export default getHelmReleaseResourcesInjectable;
