import { configStore } from "../config.store";
import { isArray } from "util";

export function isAllowedResource(resources: string|string[]) {
  if (!isArray(resources)) {
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
