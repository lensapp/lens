import { autobind } from "../../../common/utils/autobind";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";
import { LimitRange, limitRangeApi } from "../../api/endpoints/limit-range.api";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class LimitRangesStore extends KubeObjectStore<LimitRange> {
  api = limitRangeApi;
}

export const limitRangeStore = new LimitRangesStore();
apiManager.registerStore(limitRangeStore);

addLensKubeObjectMenuItem({
  Object: LimitRange,
  Icon: Remove,
  onClick: object => limitRangeStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: LimitRange,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
