// Kubeconfig api
import { apiBase } from "../index";
import { CancelablePromise } from "client/utils/cancelableFetch";
import { JsonApiData } from "../json-api";

export const kubeConfigApi = {
  getUserConfig(): CancelablePromise<JsonApiData> {
    return apiBase.get("/kubeconfig/user");
  },

  getServiceAccountConfig(account: string, namespace: string): CancelablePromise<JsonApiData> {
    return apiBase.get(`/kubeconfig/service-account/${namespace}/${account}`);
  },
};
