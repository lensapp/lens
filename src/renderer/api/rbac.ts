import { configStore } from "../config.store";

export function isAllowedResource(resources: string | string[]) {
  if (!Array.isArray(resources)) {
    resources = [resources];
  }
  const { allowedResources } = configStore;
  for (const resource of resources) {
    if (!allowedResources.includes(resource)) {
      return false;
    }
  }
  return true;
}
