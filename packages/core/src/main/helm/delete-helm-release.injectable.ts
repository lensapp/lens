/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface DeleteHelmReleaseData {
  name: string;
  namespace: string;
}

export type DeleteHelmRelease = (kubeconfigPath: string, data: DeleteHelmReleaseData) => Promise<string>;

const deleteHelmReleaseInjectable = getInjectable({
  id: "delete-helm-release",
  instantiate: (di): DeleteHelmRelease => {
    const execHelm = di.inject(execHelmInjectable);

    return async (kubeconfigPath, { name, namespace }) => {
      const result = await execHelm([
        "delete",
        name,
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      ]);

      if (result.callWasSuccessful) {
        return result.response;
      }

      throw result.error;
    };
  },
});

export default deleteHelmReleaseInjectable;
