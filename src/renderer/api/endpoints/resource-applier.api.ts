import jsYaml from "js-yaml";
import { KubeObject } from "../kube-object";
import { KubeJsonApiData } from "../kube-json-api";
import { apiBase } from "../index";
import { apiManager } from "../api-manager";
import { CancelablePromise } from "../../utils/cancelableFetch";
import { filter } from "lodash";

export const resourceApplierApi = {
  annotations: [
    "kubectl.kubernetes.io/last-applied-configuration"
  ],

  update<D extends KubeObject>(resource: object | string): CancelablePromise<D[]> {
    if (typeof resource === "string") {
      resource = jsYaml.safeLoad(resource);
    }

    return apiBase
      .post<KubeJsonApiData[]>("/stack", { data: resource })
      .then(data => filter(
        data.map(obj => {
          const api = apiManager.getApi<D>(obj.metadata.selfLink);

          if (api?.objectConstructor) {
            return new api.objectConstructor(obj);
          }
        })
      ));
  }
};
