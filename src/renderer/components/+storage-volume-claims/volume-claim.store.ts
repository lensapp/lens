import { action, observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { IPvcMetrics, PersistentVolumeClaim, pvcApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class VolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim> {
  api = pvcApi
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
