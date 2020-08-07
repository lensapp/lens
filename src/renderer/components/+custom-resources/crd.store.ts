import { computed, reaction } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { crdBetaApi, CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { apiManager } from "../../api/api-manager";
import { KubeApi } from "../../api/kube-api";
import { CRDResourceStore } from "./crd-resource.store";
import { KubeObject } from "../../api/kube-object";

function initStore(crd: CustomResourceDefinition) {
  const apiBase = crd.getResourceApiBase();
  const [kind, isNamespaced] = [crd.getResourceKind(), crd.isNamespaced()];
  const api = apiManager.getApi(apiBase) || new KubeApi({ apiBase, kind, isNamespaced });
  const store = apiManager.getStore(api) || new CRDResourceStore(api);
  apiManager.registerStore(api, store);
}

@autobind()
export class CRDStore extends KubeObjectStore<CustomResourceDefinition> {
  api = crdBetaApi

  constructor() {
    super();

    // auto-init stores for crd-s
    reaction(() => this.items.toJS(), items => items.forEach(initStore))
  }

  protected sortItems(items: CustomResourceDefinition[]) {
    return super.sortItems(items, [
      crd => crd.getGroup(),
      crd => crd.getName(),
    ])
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
    
    return this.items.find(crd => (
      kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    ))
  }
}

export const crdStore = new CRDStore();

apiManager.registerStore(crdBetaApi, crdStore);
