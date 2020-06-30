// Kubeconfig api
import { apiBase } from "../index";

export const kubeConfigApi = {
  getUserConfig() {
    return apiBase.get("/kubeconfig/user");
  },

  getServiceAccountConfig(account: string, namespace: string) {
    return apiBase.get(`/kubeconfig/service-account/${namespace}/${account}`);
  },
};
