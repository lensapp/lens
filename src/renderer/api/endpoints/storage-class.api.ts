import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

export class StorageClass extends KubeObject {
  static kind = "StorageClass";
  static namespaced = false;
  static apiBase = "/apis/storage.k8s.io/v1/storageclasses";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  provisioner: string; // e.g. "storage.k8s.io/v1"
  mountOptions?: string[];
  volumeBindingMode: string;
  reclaimPolicy: string;
  parameters: {
    [param: string]: string; // every provisioner has own set of these parameters
  };

  isDefault() {
    const annotations = this.metadata.annotations || {};

    return (
      annotations["storageclass.kubernetes.io/is-default-class"] === "true" ||
      annotations["storageclass.beta.kubernetes.io/is-default-class"] === "true"
    );
  }

  getVolumeBindingMode() {
    return this.volumeBindingMode || "-";
  }

  getReclaimPolicy() {
    return this.reclaimPolicy || "-";
  }
}

export const storageClassApi = new KubeApi({
  objectConstructor: StorageClass,
});
