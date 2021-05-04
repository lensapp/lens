import { KubeObjectStore } from "../../kube-object.store";
import { StorageClass, storageClassApi } from "../../api/endpoints/storage-class.api";
import { apiManager } from "../../api/api-manager";
import { volumesStore } from "../+storage-volumes/volumes.store";
import { autobind } from "../../../common/utils";

@autobind
export class StorageClassStore extends KubeObjectStore<StorageClass> {
  api = storageClassApi;

  getPersistentVolumes(storageClass: StorageClass) {
    return volumesStore.getByStorageClass(storageClass);
  }
}

export const storageClassStore = new StorageClassStore();
apiManager.registerStore(storageClassStore);
