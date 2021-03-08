import { KubeObject, KubeObjectStatus } from "../renderer-api/k8s-api";
import { BaseRegistry } from "./base-registry";

export interface KubeObjectStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus;
}

export class KubeObjectStatusRegistry extends BaseRegistry<KubeObjectStatusRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.getItems()
      .filter((item) => (
        item.kind === kind
        && item.apiVersions.includes(apiVersion)
      ));
  }

  getItemsForObject(src: KubeObject) {
    return this.getItemsForKind(src.kind, src.apiVersion)
      .map(item => item.resolve(src))
      .filter(Boolean);
  }
}

export const kubeObjectStatusRegistry = new KubeObjectStatusRegistry();
