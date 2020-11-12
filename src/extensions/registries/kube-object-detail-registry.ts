import React from "react"
import { BaseRegistry, BaseRegistryItem } from "./base-registry";

export interface KubeObjectDetailComponents {
  Details: React.ComponentType<any>;
}

export interface KubeObjectDetailRegistration extends BaseRegistryItem {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents;
  priority?: number;
}

export class KubeObjectDetailRegistry extends BaseRegistry<KubeObjectDetailRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    const items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    }).map((item) => {
      if (item.priority === null) {
        item.priority = 50
      }
      return item
    })
    return items.sort((a, b) => b.priority - a.priority)
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry()
