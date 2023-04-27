/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import execHelmInjectable from "../../../exec-helm/exec-helm.injectable";
import yaml from "js-yaml";
import type { KubeJsonApiData, KubeJsonApiDataList } from "@k8slens/kube-object";

const callForHelmManifestInjectable = getInjectable({
  id: "call-for-helm-manifest",

  instantiate: (di) => {
    const execHelm = di.inject(execHelmInjectable);

    return async (
      name: string,
      namespace: string,
      kubeconfigPath: string,
    ): AsyncResult<(KubeJsonApiData | KubeJsonApiDataList)[]> => {
      const result = await execHelm([
        "get",
        "manifest",
        name,
        "--namespace",
        namespace,
        "--kubeconfig",
        kubeconfigPath,
      ]);

      if (!result.callWasSuccessful) {
        return { callWasSuccessful: false, error: result.error.message };
      }

      return {
        callWasSuccessful: true,
        response: yaml
          .loadAll(result.response)
          .filter((manifest) => !!manifest) as KubeJsonApiData[],
      };
    };

  },
});

export default callForHelmManifestInjectable;
