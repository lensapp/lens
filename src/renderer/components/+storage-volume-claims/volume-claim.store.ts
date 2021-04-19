import { action, observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { IPvcMetrics, PersistentVolumeClaim, pvcApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class VolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim> {
  api = pvcApi;
  @observable metrics: IPvcMetrics = null;

  @action
  async loadMetrics(pvc: PersistentVolumeClaim) {
    this.metrics = await pvcApi.getMetrics(pvc.getName(), pvc.getNs());
  }

  reset() {
    this.metrics = null;
  }
}

export const volumeClaimStore = new VolumeClaimStore();
apiManager.registerStore(volumeClaimStore);

addLensKubeObjectMenuItem({
  Object: PersistentVolumeClaim,
  Icon: Remove,
  onClick: object => volumeClaimStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: PersistentVolumeClaim,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
