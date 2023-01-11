/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface GetHelmReleaseValuesData {
  name: string;
  namespace: string;
  all?: boolean;
}

export type GetHelmReleaseValues = (kubeconfigPath: string, data: GetHelmReleaseValuesData) => Promise<string>;

const getHelmReleaseValuesInjectable = getInjectable({
  id: "get-helm-release-values",
  instantiate: (di): GetHelmReleaseValues => {
    const execHelm = di.inject(execHelmInjectable);

    return async (kubeconfigPath, { name, namespace, all = false }) => {
      const args = [
        "get",
        "values",
        name,
      ];

      if (all) {
        args.push("--all");
      }

      args.push(
        "--output", "yaml",
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      );

      const result = await execHelm(args);

      if (result.callWasSuccessful) {
        return result.response;
      }

      throw result.error;
    };
  },
});

export default getHelmReleaseValuesInjectable;
