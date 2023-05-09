/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "@k8slens/utilities";
import { result, isObject, json } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseData } from "../../../features/helm-releases/common/channels";
import execHelmInjectable from "../exec-helm/exec-helm.injectable";

export type GetHelmReleaseData = (
  name: string,
  namespace: string,
  kubeconfigPath: string,
) => AsyncResult<HelmReleaseData, Error>;

const getHelmReleaseDataInjectable = getInjectable({
  id: "get-helm-release-data",
  instantiate: (di): GetHelmReleaseData => {
    const execHelm = di.inject(execHelmInjectable);

    return async (releaseName, namespace, proxyKubeconfigPath) => {
      const helmResult = await execHelm([
        "status",
        releaseName,
        "--namespace",
        namespace,
        "--kubeconfig",
        proxyKubeconfigPath,
        "--output",
        "json",
      ]);

      if (!helmResult.isOk) {
        return result.wrapError("Failed to execute 'helm status'", helmResult);
      }

      const parseResult = json.parse(helmResult.value);

      if (!parseResult.isOk) {
        return result.wrapError("Failed to parse result from 'helm status'", parseResult);
      }

      const release = parseResult.value;

      if (!isObject(release) || Array.isArray(release)) {
        return result.error(new Error(`Result from 'helm status' is not an object: ${JSON.stringify(release)}`));
      }

      return result.ok(release as unknown as HelmReleaseData);
    };
  },
});

export default getHelmReleaseDataInjectable;
