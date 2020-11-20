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

export class KubeObjectDetailRegistry extends BaseRegistry<KubeObjectDetailRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.getItems()
      .filter(item => item.kind === kind && item.apiVersions.includes(apiVersion))
      .map(item => (item.priority ??= 50, item))
      .sort((a, b) => b.priority - a.priority);
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry();
