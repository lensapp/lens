/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

const execHelm = asLegacyGlobalFunctionForExtensionApi(execHelmInjectable);

export async function rollback(name: string, namespace: string, revision: number, kubeconfigPath: string): Promise<void> {
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
}
