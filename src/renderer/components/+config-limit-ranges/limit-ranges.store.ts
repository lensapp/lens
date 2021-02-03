import { autobind } from "../../../common/utils/autobind";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import { LimitRange, limitRangeApi } from "../../api/endpoints/limit-range.api";

@autobind()
export class LimitRangesStore extends KubeObjectStore<LimitRange> {
  api = limitRangeApi;
}

export const limitRangeStore = new LimitRangesStore();
apiManager.registerStore(limitRangeStore);
