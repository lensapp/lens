// All registries managed by extensions api

import { Cluster } from "../../main/cluster";

export * from "./page-registry";
export * from "./page-menu-registry";
export * from "./menu-registry";
export * from "./app-preference-registry";
export * from "./status-bar-registry";
export * from "./kube-object-detail-registry";
export * from "./kube-object-menu-registry";
export * from "./kube-object-status-registry";
export * from "./command-registry";

export type Registrable<T> = (T[]) | ((cluster?: Cluster | null) => T[]);

export function recitfyRegisterable<T>(src: Registrable<T>, getCluster?: () => Cluster | null | undefined): T[] {
  if (typeof src === "function") {
    return src(getCluster());
  }

  return src;
}
