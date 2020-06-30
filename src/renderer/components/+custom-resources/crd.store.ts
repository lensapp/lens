import { computed, reaction } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { crdApi, CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { apiManager } from "../../api/api-manager";
import { KubeApi } from "../../api/kube-api";
import { CRDResourceStore } from "./crd-resource.store";
import { KubeObject } from "../../api/kube-object";

@autobind()
export class CRDStore extends KubeObjectStore<CustomResourceDefinition> {
  api = crdApi

  constructor() {
    super();

    // auto-init stores for crd-s
    reaction(() => this.items.toJS(), items => {
      items.forEach(this.initStore);
    })
  }

  protected sortItems(items: CustomResourceDefinition[]) {
    return super.sortItems(items, [
      crd => crd.getGroup(),
      crd => crd.getName(),
    ])
  }

  protected initStore(crd: CustomResourceDefinition) {
    const apiBase = crd.getResourceApiBase();
    let api = apiManager.getApi(apiBase);
    if (!api) {
      api = new KubeApi({
        apiBase: apiBase,
        kind: crd.getResourceKind(),
        isNamespaced: crd.isNamespaced(),
      });
    }
    let store = apiManager.getStore(api);
    if (!store) {
      store = new CRDResourceStore(api);
      apiManager.registerStore(api, store);
    }
  }

  @computed get groups() {
    const groups: Record<string, CustomResourceDefinition[]> = {};
    return this.items.reduce((groups, crd) => {
      const group = crd.getGroup();
      if (!groups[group]) groups[group] = [];
      groups[group].push(crd);
      return groups;
    }, groups)
  }

  getByGroup(group: string, pluralName: string) {
    const crdInGroup = this.groups[group];
    if (!crdInGroup) return null;
    return crdInGroup.find(crd => crd.getPluralName() === pluralName);
  }

  getByObject(obj: KubeObject) {
    if (!obj) return null
    const { kind, apiVersion } = obj;
    return this.items.find(crd => {
      return kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    })
  }
}

export const crdStore = new CRDStore();

apiManager.registerStore(crdApi, crdStore);
