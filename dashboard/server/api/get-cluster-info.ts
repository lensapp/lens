// Get cluster info

import config from "../config"
import { kubeRequest } from "./kube-request";
import { IClusterInfo, IClusterConfigMap } from "../common/cluster"

export async function getClusterInfo(): Promise<IClusterInfo> {
  const [configMap, kubeVersion, pharosVersion] = await Promise.all([
    getClusterConfigMap().catch(() => ({} as IClusterConfigMap)),
    getKubeVersion().catch(() => null),
    getPharosVersion().catch(() => null),
  ]);
  return {
    ...configMap,
    kubeVersion,
    pharosVersion,
  };
}

export async function getClusterConfigMap() {
  const res = await kubeRequest<{ data: IClusterConfigMap }>({
    path: `/api/v1/namespaces/${config.LENS_NAMESPACE}/configmaps/config`,
  });
  return res.data;
}

export async function getKubeVersion() {
  const res = await kubeRequest<{ gitVersion: string }>({
    path: "/version",
  });
  return res.gitVersion.slice(1);
}

export async function getPharosVersion() {
  const res = await kubeRequest<{ data: { "pharos-version": string } }>({
    path: `/api/v1/namespaces/kube-system/configmaps/pharos-config`,
  });
  return res ? res.data["pharos-version"] : null;
}
