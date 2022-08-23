/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "../../../../../common/utils/async-result";
import execHelmInjectable from "../../../exec-helm/exec-helm.injectable";
import yaml from "js-yaml";

export interface HelmResourceManifest {
  metadata: {
    namespace: string;
  };
}

const callForHelmManifestInjectable = getInjectable({
  id: "call-for-helm-manifest",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);

    return async (
      name: string,
      namespace: string,
      kubeconfigPath: string,
    ): Promise<AsyncResult<HelmResourceManifest[]>> => {
      const result = await execHelm(
        "get",
        "manifest",
        name,
        "--namespace",
        namespace,
        "--kubeconfig",
        kubeconfigPath,
      );

      if (!result.callWasSuccessful) {
        return { callWasSuccessful: false, error: result.error };
      }

      return {
        callWasSuccessful: true,
        response: yaml
          .loadAll(result.response)
          .filter((manifest) => !!manifest) as HelmResourceManifest[],
      };
    };

  },
});

export default callForHelmManifestInjectable;
