import { PodSecurityPolicy, pspApi } from "../../api/endpoints";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

export class PodSecurityPoliciesStore extends KubeObjectStore<PodSecurityPolicy> {
  api = pspApi;
}

export const podSecurityPoliciesStore = new PodSecurityPoliciesStore();
apiManager.registerStore(podSecurityPoliciesStore);
