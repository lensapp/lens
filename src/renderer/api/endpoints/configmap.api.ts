import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class ConfigMap extends KubeObject<void, void> {
  static kind = "ConfigMap";
  static namespaced = true;
  static apiBase = "/api/v1/configmaps";

  data: Record<string, string> = {};

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export const configMapApi = new KubeApi({
  objectConstructor: ConfigMap,
});
