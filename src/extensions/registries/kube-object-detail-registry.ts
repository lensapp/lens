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
    const items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    });

    return items.sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50));
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry();
