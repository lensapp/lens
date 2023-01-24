/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface RollbackHelmReleaseData {
  name: string;
  namespace: string;
  revision: number;
}

export type RollbackHelmRelease = (kubeconfigPath: string, data: RollbackHelmReleaseData) => Promise<void>;

const rollbackHelmReleaseInjectable = getInjectable({
  id: "rollback-helm-release",
  instantiate: (di): RollbackHelmRelease => {
    const execHelm = di.inject(execHelmInjectable);

    return async (kubeconfigPath, { name, namespace, revision }) => {
      const result = await execHelm([
        "rollback",
        name,
        `${revision}`,
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      ]);

      if (!result.callWasSuccessful) {
        throw result.error;
      }
    };
  },
});

export default rollbackHelmReleaseInjectable;
