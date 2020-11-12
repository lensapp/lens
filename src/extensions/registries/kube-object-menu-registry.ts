import React from "react"
import { BaseRegistry, BaseRegistryItem } from "./base-registry";

export interface KubeObjectMenuComponents {
  MenuItem: React.ComponentType<any>;
}

export interface KubeObjectMenuRegistration extends BaseRegistryItem {
  kind: string;
  apiVersions: string[];
  components: KubeObjectMenuComponents;
}

export class KubeObjectMenuRegistry extends BaseRegistry<KubeObjectMenuRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectMenuRegistry = new KubeObjectMenuRegistry()
