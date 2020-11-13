import { KubeObject, KubeObjectStatus } from "../renderer-api/k8s-api";
import { BaseRegistry } from "./base-registry";

export interface KubeObjectStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus;
}

export class KubeObjectStatusRegistry extends BaseRegistry<KubeObjectStatusRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectStatusRegistry = new KubeObjectStatusRegistry();
