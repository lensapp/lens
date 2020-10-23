import { observable } from "mobx"
import React from "react"

export interface KubeObjectMenuComponents {
  MenuItem: React.ComponentType<any>;
}

export interface KubeObjectMenuRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectMenuComponents;
}

export class KubeObjectMenuRegistry {
  items = observable.array<KubeObjectMenuRegistration>([], { deep: false });

  add(item: KubeObjectMenuRegistration) {
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

export const kubeObjectMenuRegistry = new KubeObjectMenuRegistry()
