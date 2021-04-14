import jsYaml from "js-yaml";
import { KubeObject } from "../kube-object";
import { apiBase } from "../index";
import { apiManager } from "../api-manager";

export const resourceApplierApi = {
  annotations: [
    "kubectl.kubernetes.io/last-applied-configuration"
  ],

  async update<Spec, Status, D extends KubeObject<Spec, Status>>(resource: object | string): Promise<D | D[]> {
    if (typeof resource === "string") {
      resource = jsYaml.safeLoad(resource);
    }

    const data = await apiBase.post<D[]>("/stack", { data: resource });
    const items = data.map(obj => {
      const api = apiManager.getApiByKind(obj.kind, obj.apiVersion);

      if (api) {
        return new api.objectConstructor(obj) as D;
      }

      return new KubeObject(obj) as D;
    });

    return items.length === 1 ? items[0] : items;
  }
};
