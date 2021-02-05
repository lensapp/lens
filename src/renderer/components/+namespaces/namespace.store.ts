import { action, comparer, observable, reaction } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints";
import { createPageParam } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { isAllowedResource } from "../../../common/rbac";
import { getHostedCluster } from "../../../common/cluster-store";

const storage = createStorage<string[]>("context_namespaces", []);

export const namespaceUrlParam = createPageParam<string[]>({
  name: "namespaces",
  isSystem: true,
  multiValues: true,
  get defaultValue() {
    return storage.get(); // initial namespaces coming from URL or local-storage (default)
  }
});

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  contextNs = observable.array<string>();

  constructor() {
    super();
    this.init();
  }

  private init() {
    this.setContext(this.initNamespaces);

    return reaction(() => this.contextNs.toJS(), namespaces => {
      storage.set(namespaces); // save to local-storage
      namespaceUrlParam.set(namespaces, { replaceHistory: true }); // update url
    }, {
      fireImmediately: true,
      equals: comparer.identity,
    });
  }

  get initNamespaces() {
    return namespaceUrlParam.get();
  }

  getContextParams() {
    return {
      namespaces: this.contextNs.toJS(),
    };
  }

  subscribe(apis = [this.api]) {
    const { accessibleNamespaces } = getHostedCluster();

    // if user has given static list of namespaces let's not start watches because watch adds stuff that's not wanted
    if (accessibleNamespaces.length > 0) {
      return Function; // no-op
    }

    return super.subscribe(apis);
  }

  protected async loadItems(namespaces?: string[]) {
    if (!isAllowedResource("namespaces")) {
      if (namespaces) return namespaces.map(this.getDummyNamespace);

      return [];
    }

    if (namespaces) {
      return Promise.all(namespaces.map(name => this.api.get({ name })));
    } else {
      return super.loadItems();
    }
  }

  protected getDummyNamespace(name: string) {
    return new Namespace({
      kind: "Namespace",
      apiVersion: "v1",
      metadata: {
        name,
        uid: "",
        resourceVersion: "",
        selfLink: `/api/v1/namespaces/${name}`
      }
    });
  }

  @action
  setContext(namespaces: string[]) {
    this.contextNs.replace(namespaces);
  }

  hasContext(namespace: string | string[]) {
    const context = Array.isArray(namespace) ? namespace : [namespace];

    return context.every(namespace => this.contextNs.includes(namespace));
  }

  @action
  toggleContext(namespace: string) {
    if (this.hasContext(namespace)) this.contextNs.remove(namespace);
    else this.contextNs.push(namespace);
  }

  @action
  reset() {
    super.reset();
    this.contextNs.clear();
  }

  @action
  async remove(item: Namespace) {
    await super.remove(item);
    this.contextNs.remove(item.getName());
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespaceStore);
