import { KubeObject } from "../kube-object";
import { KubeJsonApiData } from "../kube-json-api";
import { KubeApi } from "../kube-api";

export type ConfigMapData = Record<string, string>;

export class ConfigMap extends KubeObject {
  static kind = "ConfigMap";
  static namespaced = true;
  static apiBase = "/api/v1/configmaps";

  constructor(data: KubeJsonApiData) {
    super(data);
    this.data = this.data || {};
  }

  data: ConfigMapData;

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export const configMapApi = new KubeApi({
  objectConstructor: ConfigMap,
});
