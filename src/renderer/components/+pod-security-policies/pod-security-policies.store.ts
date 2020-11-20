import { PodSecurityPolicy, pspApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class PodSecurityPoliciesStore extends KubeObjectStore<PodSecurityPolicy> {
  api = pspApi
}

export const podSecurityPoliciesStore = new PodSecurityPoliciesStore()
apiManager.registerStore(podSecurityPoliciesStore);
