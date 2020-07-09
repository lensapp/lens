import { action, observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { PvcMetrics, PersistentVolumeClaim, pvcApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class VolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim> {
  api = pvcApi
  @observable metrics: PvcMetrics = null;

  @action
  async loadMetrics(pvc: PersistentVolumeClaim): Promise<void> {
    this.metrics = await pvcApi.getMetrics(pvc.getName(), pvc.getNs());
  }

  reset(): void {
    this.metrics = null;
  }
}

export const volumeClaimStore = new VolumeClaimStore();
apiManager.registerStore(pvcApi, volumeClaimStore);
