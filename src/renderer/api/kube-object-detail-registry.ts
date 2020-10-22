import { observable } from "mobx"
import React from "react"

export interface KubeObjectDetailComponents {
  Details: React.ComponentType<any>;
}

export interface KubeObjectDetailRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectDetailComponents;
}

export class KubeObjectDetailRegistry {
  items = observable.array<KubeObjectDetailRegistration>([], { deep: false });

  add(item: KubeObjectDetailRegistration) {
    this.items.push(item)
    return () => {
      this.items.replace(
        this.items.filter(c => c !== item)
      )
    };
  }

  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectDetailRegistry = new KubeObjectDetailRegistry()
