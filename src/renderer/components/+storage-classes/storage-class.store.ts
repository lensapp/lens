import { KubeObjectStore } from "../../kube-object.store";
import { autoBind } from "../../utils";
import { StorageClass, storageClassApi } from "../../api/endpoints/storage-class.api";
import { apiManager } from "../../api/api-manager";
import { volumesStore } from "../+storage-volumes/volumes.store";

export class StorageClassStore extends KubeObjectStore<StorageClass> {
  api = storageClassApi;

  constructor() {
    super();
    autoBind(this);
  }

  getPersistentVolumes(storageClass: StorageClass) {
    return volumesStore.getByStorageClass(storageClass);
  }
}

export const storageClassStore = new StorageClassStore();
apiManager.registerStore(storageClassStore);
