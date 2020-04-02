import { KubeObject } from "../kube-object";
import { KubeJsonApiData } from "../kube-json-api";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class ConfigMap extends KubeObject {
  static kind = "ConfigMap";

  constructor(data: KubeJsonApiData) {
    super(data);
    this.data = this.data || {};
  }

  data: {
    [param: string]: string;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export const configMapApi = new KubeApi({
  kind: ConfigMap.kind,
  apiBase: "/api/v1/configmaps",
  isNamespaced: true,
  objectConstructor: ConfigMap,
});
