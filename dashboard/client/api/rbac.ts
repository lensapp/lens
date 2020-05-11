import { configStore } from "../config.store";

export function isAllowedResource(resource: string) {
  const { allowedResources } = configStore;
  return allowedResources.includes(resource)
}
