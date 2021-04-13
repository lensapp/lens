const anyKubeconfig = /^kubeconfig$/i;

/**
 * This function deletes all keys of the form /^kubeconfig$/i, returning a new
 * object.
 *
 * This is needed because `kubectl` checks for other version of kubeconfig
 * before KUBECONFIG and we only set KUBECONFIG.
 * @param env The current copy of env
 */
export function clearKubeconfigEnvVars(env: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => anyKubeconfig.exec(key) === null)
  );
}
