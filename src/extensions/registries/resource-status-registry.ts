import { KubeObject } from "../renderer-api/k8s-api";

import { BaseRegistry } from "./base-registry";

export enum ResourceStatusColor {
  INFO = "info",
  SUCCESS = "success",
  ERROR = "error"
}

export abstract class ResourceStatusResolver {
  protected object: KubeObject

  constructor(object: KubeObject) {
    this.object = object
  }

  public abstract getStatusText(): string
  public abstract getStatusColor(): string
}

export interface ResourceStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolver: (object: KubeObject) => ResourceStatusResolver;
}

export class ResourceStatusRegistry extends BaseRegistry<ResourceStatusRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const resourceStatusRegistry = new ResourceStatusRegistry();
