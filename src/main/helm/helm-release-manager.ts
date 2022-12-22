/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonValue } from "type-fest";
import { json } from "../../common/utils";
import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

const execHelm = asLegacyGlobalFunctionForExtensionApi(execHelmInjectable);

export async function deleteRelease(name: string, namespace: string, kubeconfigPath: string): Promise<string> {
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
}

interface GetValuesOptions {
  namespace: string;
  all?: boolean;
  kubeconfigPath: string;
}

export async function getValues(name: string, { namespace, all = false, kubeconfigPath }: GetValuesOptions): Promise<string> {
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
}

export async function getHistory(name: string, namespace: string, kubeconfigPath: string): Promise<JsonValue> {
  const result = await execHelm([
    "history",
    name,
    "--output", "json",
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ]);

  if (result.callWasSuccessful) {
    return json.parse(result.response);
  }

  throw result.error;
}

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
