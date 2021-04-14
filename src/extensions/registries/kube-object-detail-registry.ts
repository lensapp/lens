import React from "react";
import { BaseRegistry } from "./base-registry";

export interface KubeObjectDetailComponents {
  Details: React.ComponentType<any>;
}

export interface KubeObjectDetailRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents;
  priority?: number;
}

export interface RegisteredKubeObjectDetails extends KubeObjectDetailRegistration {
  priority: number;
}

export class KubeObjectDetailRegistry extends BaseRegistry<KubeObjectDetailRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    const items = this.getItems()
      .filter(item => (
        item.kind === kind
        && item.apiVersions.includes(apiVersion)
      ))
      .map(item => (
        item.priority ??= 50, item as RegisteredKubeObjectDetails
      ));

    return items.sort((a, b) => b.priority - a.priority);
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry();
