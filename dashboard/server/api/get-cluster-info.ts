// Get cluster info

import { kubeRequest } from "./kube-request";
import { IClusterInfo } from "../common/cluster"

export async function getClusterInfo(): Promise<IClusterInfo> {
  const [kubeVersion] = await Promise.all([
    getKubeVersion().catch(() => null),
  ]);
  return {
    kubeVersion,
  };
}

export async function getKubeVersion() {
  const res = await kubeRequest<{ gitVersion: string }>({
    path: "/version",
  });
  return res.gitVersion.slice(1);
}
