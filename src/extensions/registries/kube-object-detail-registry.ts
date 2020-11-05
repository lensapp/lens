import React from "react"
import { BaseRegistry } from "./base-registry";

export interface KubeObjectDetailComponents {
  Details: React.ComponentType<any>;
}

export interface KubeObjectDetailRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents;
}

export class KubeObjectDetailRegistry extends BaseRegistry<KubeObjectDetailRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry()
