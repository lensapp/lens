import { KubeObjectStore } from "../../kube-object.store";
import { autoBind } from "../../utils";
import { PersistentVolume, persistentVolumeApi } from "../../api/endpoints/persistent-volume.api";
import { apiManager } from "../../api/api-manager";
import { StorageClass } from "../../api/endpoints/storage-class.api";

export class PersistentVolumesStore extends KubeObjectStore<PersistentVolume> {
  api = persistentVolumeApi;

  constructor() {
    super();
    autoBind(this);
  }

  getByStorageClass(storageClass: StorageClass): PersistentVolume[] {
    return this.items.filter(volume =>
      volume.getStorageClassName() === storageClass.getName()
    );
  }
}

export const volumesStore = new PersistentVolumesStore();
apiManager.registerStore(volumesStore);
