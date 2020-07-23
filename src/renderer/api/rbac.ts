import { clusterStore } from "../../common/cluster-store";

// todo: refactor / move to cluster-store.ts?

export function isAllowedResource(resources: string | string[]) {
  if (!Array.isArray(resources)) {
    resources = [resources];
  }
  const allowedResources = clusterStore.activeCluster?.allowedResources || [];
  for (const resource of resources) {
    if (!allowedResources.includes(resource)) {
      return false;
    }
  }
  return true;
}
