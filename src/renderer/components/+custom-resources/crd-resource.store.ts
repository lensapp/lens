import { autobind } from "../../utils";
import { KubeApi } from "../../api/kube-api";
import { KubeObjectStore } from "../../kube-object.store";
import { KubeObject } from "../../api/kube-object";

@autobind()
export class CRDResourceStore<T extends KubeObject = KubeObject> extends KubeObjectStore<T> {
  constructor(public api: KubeApi<T>) {
    super();
  }
}
