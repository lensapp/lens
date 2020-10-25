import React from "react"
import { BaseRegistry } from "./base-registry";

export interface KubeObjectMenuComponents {
  MenuItem: React.ComponentType<any>;
}

export interface KubeObjectMenuRegistration {
  kind: string;
  apiVersions: string[];
  components: KubeObjectMenuComponents;
}

export class KubeObjectMenuRegistry extends BaseRegistry<KubeObjectMenuRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectMenuRegistry = new KubeObjectMenuRegistry()
