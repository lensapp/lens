import { KubeObject } from "../renderer-api/k8s-api";

import { BaseRegistry } from "./base-registry";

export enum ResourceStatusLevel {
  INFO = 1,
  WARNING = 2,
  CRITICAL = 3
}

export type ResourceStatus = {
  level: number;
  text: string;
  timestamp?: string;
}

export interface ResourceStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => ResourceStatus;
}

export class ResourceStatusRegistry extends BaseRegistry<ResourceStatusRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const resourceStatusRegistry = new ResourceStatusRegistry();
