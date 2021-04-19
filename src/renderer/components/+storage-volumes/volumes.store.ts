import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { PersistentVolume, persistentVolumeApi } from "../../api/endpoints/persistent-volume.api";
import { apiManager } from "../../api/api-manager";
import { StorageClass } from "../../api/endpoints/storage-class.api";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { Remove, Update } from "@material-ui/icons";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class PersistentVolumesStore extends KubeObjectStore<PersistentVolume> {
  api = persistentVolumeApi;

  getByStorageClass(storageClass: StorageClass): PersistentVolume[] {
    return this.items.filter(volume =>
      volume.getStorageClassName() === storageClass.getName()
    );
  }
}

export const volumesStore = new PersistentVolumesStore();
apiManager.registerStore(volumesStore);

addLensKubeObjectMenuItem({
  Object: PersistentVolume,
  Icon: Remove,
  onClick: object => volumesStore.remove(object),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: PersistentVolume,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});
