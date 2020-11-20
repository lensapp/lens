import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { PersistentVolume, persistentVolumeApi } from "../../api/endpoints/persistent-volume.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class PersistentVolumesStore extends KubeObjectStore<PersistentVolume> {
  api = persistentVolumeApi
}

export const volumesStore = new PersistentVolumesStore();
apiManager.registerStore(volumesStore);
