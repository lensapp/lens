/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

const anyKubeconfig = /^kubeconfig$/i;

/**
 * This function deletes all keys of the form /^kubeconfig$/i, returning a new
 * object.
 *
 * This is needed because `kubectl` checks for other version of kubeconfig
 * before KUBECONFIG and we only set KUBECONFIG.
 * @param env The current copy of env
 */
export function clearKubeconfigEnvVars(env: Partial<Record<string, string>>): Partial<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => anyKubeconfig.exec(key) === null),
  );
}
