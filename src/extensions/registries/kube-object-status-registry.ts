import { KubeObject } from "../renderer-api/k8s-api";

import { BaseRegistry } from "./base-registry";

export enum KubeObjectStatusLevel {
  INFO = 1,
  WARNING = 2,
  CRITICAL = 3
}

export type KubeObjectStatus = {
  level: number;
  text: string;
  timestamp?: string;
}

export interface KubeObjectStatusRegistration {
  kind: string;
  apiVersions: string[];
  resolve: (object: KubeObject) => KubeObjectStatus;
}

export class KubeObjectStatusRegistry extends BaseRegistry<KubeObjectStatusRegistration> {
  getItemsForKind(kind: string, apiVersion: string) {
    return this.items.filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion)
    })
  }
}

export const kubeObjectStatusRegistry = new KubeObjectStatusRegistry();
