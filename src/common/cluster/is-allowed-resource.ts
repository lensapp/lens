/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../rbac";
import { apiResourceRecord, apiResources } from "../rbac";

export const isAllowedResource = (allowedResources: string[]) => (kind: string): boolean => {
  if ((kind as KubeResource) in apiResourceRecord) {
    return allowedResources.includes(kind);
  }

  const apiResource = apiResources.find(resource => resource.kind === kind);

  if (apiResource) {
    return allowedResources.includes(apiResource.apiName);
  }

  return true; // allowed by default for other resources
};
