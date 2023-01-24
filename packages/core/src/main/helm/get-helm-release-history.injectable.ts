/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseRevision } from "../../common/k8s-api/endpoints/helm-releases.api/request-history.injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface GetHelmReleaseHistoryData {
  name: string;
  namespace: string;
}

export type GetHelmReleaseHistory = (kubeconfigPath: string, data: GetHelmReleaseHistoryData) => Promise<HelmReleaseRevision[]>;

const getHelmReleaseHistoryInjectable = getInjectable({
  id: "get-helm-release-history",
  instantiate: (di): GetHelmReleaseHistory => {
    const execHelm = di.inject(execHelmInjectable);

    return async (kubeconfigPath, { name, namespace }) => {
      const result = await execHelm([
        "history",
        name,
        "--output", "json",
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      ]);

      if (result.callWasSuccessful) {
        return JSON.parse(result.response);
      }

      throw result.error;
    };
  },
});

export default getHelmReleaseHistoryInjectable;
