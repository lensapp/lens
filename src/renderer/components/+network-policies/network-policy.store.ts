import { KubeObjectStore } from "../../kube-object.store";
import { NetworkPolicy, networkPolicyApi } from "../../api/endpoints/network-policy.api";
import { apiManager } from "../../api/api-manager";
import { autobind } from "../../../common/utils";

@autobind
export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy> {
  api = networkPolicyApi;
}

export const networkPolicyStore = new NetworkPolicyStore();
apiManager.registerStore(networkPolicyStore);
