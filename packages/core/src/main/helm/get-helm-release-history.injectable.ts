/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncResult } from "@k8slens/utilities";
import { json, result, isArray } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseRevision } from "../../common/k8s-api/endpoints/helm-releases.api/request-history.injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface GetHelmReleaseHistoryData {
  name: string;
  namespace: string;
}

export type GetHelmReleaseHistory = (kubeconfigPath: string, data: GetHelmReleaseHistoryData) => AsyncResult<HelmReleaseRevision[], Error>;

const getHelmReleaseHistoryInjectable = getInjectable({
  id: "get-helm-release-history",
  instantiate: (di): GetHelmReleaseHistory => {
    const execHelm = di.inject(execHelmInjectable);

    return async (kubeconfigPath, { name, namespace }) => {
      const helmResult = await execHelm([
        "history",
        name,
        "--output", "json",
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      ]);

      if (!helmResult.isOk) {
        return helmResult;
      }

      const parsedResult = json.parse(helmResult.value);

      if (!parsedResult.isOk) {
        return result.wrapError("Failed to parse result from 'helm history' call", parsedResult);
      }

      if (!isArray(parsedResult.value)) {
        return result.error(new Error("Return value from 'helm history' is not an array, as expected"));
      }

      return result.ok(parsedResult.value as HelmReleaseRevision[]);
    };
  },
});

export default getHelmReleaseHistoryInjectable;
