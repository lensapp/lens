import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { StorageClass, storageClassApi } from "../../api/endpoints/storage-class.api";
import { apiManager } from "../../api/api-manager";

@autobind()
export class StorageClassStore extends KubeObjectStore<StorageClass> {
  api = storageClassApi
}

export const storageClassStore = new StorageClassStore();
apiManager.registerStore(storageClassStore);
