import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { NetworkPolicy, networkPolicyApi } from "../../api/endpoints/network-policy.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy> {
  api = networkPolicyApi
}

export const networkPolicyStore = new NetworkPolicyStore();
apiManager.registerStore(networkPolicyStore);
