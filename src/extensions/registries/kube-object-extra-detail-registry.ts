import React from "react"
import { BaseRegistry } from "./base-registry";

export interface KubeObjectExtraDetailComponents {
  Details: React.ComponentType<any>;
}

export interface KubeObjectExtraDetailRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectExtraDetailComponents;
}

export class KubeObjectExtraDetailRegistry extends BaseRegistry<KubeObjectExtraDetailRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectExtraDetailRegistry = new KubeObjectExtraDetailRegistry()
