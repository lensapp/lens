import { action, observable, reaction } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints";
import { IQueryParams, navigation, setQueryParams } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { isAllowedResource } from "../../../common/rbac";

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  contextNs = observable.array<string>();

  protected storage = createStorage<string[]>("context_ns", this.contextNs);

  get initNamespaces() {
    const fromUrl = navigation.searchParams.getAsArray("namespaces");
    return fromUrl.length ? fromUrl : this.storage.get();
  }

  constructor() {
    super();

    // restore context namespaces
    const { initNamespaces: namespaces } = this;
    this.setContext(namespaces);
    this.updateUrl(namespaces);

    // sync with local-storage & url-search-params
    reaction(() => this.contextNs.toJS(), namespaces => {
      this.storage.set(namespaces);
      this.updateUrl(namespaces);
    });
  }

  getContextParams(): Partial<IQueryParams> {
    return {
      namespaces: this.contextNs
    }
  }

  protected updateUrl(namespaces: string[]) {
    setQueryParams({ namespaces }, { replace: true })
  }

  protected async loadItems(namespaces?: string[]) {
    if (!isAllowedResource("namespaces")) {
      if (namespaces) return namespaces.map(this.getDummyNamespace);
      return []
    }
    if (namespaces) {
      return Promise.all(namespaces.map(name => this.api.get({ name })))
    } else {
      return super.loadItems();
    }
  }

  protected getDummyNamespace(name: string) {
    return new Namespace({
      kind: "Namespace",
      apiVersion: "v1",
      metadata: {
        name: name,
        uid: "",
        resourceVersion: "",
        selfLink: `/api/v1/namespaces/${name}`
      }
    })
  }

  setContext(namespaces: string[]) {
    this.contextNs.replace(namespaces);
  }

  hasContext(namespace: string | string[]) {
    const context = Array.isArray(namespace) ? namespace : [namespace];
    return context.every(namespace => this.contextNs.includes(namespace));
  }

  toggleContext(namespace: string) {
    if (this.hasContext(namespace)) this.contextNs.remove(namespace);
    else this.contextNs.push(namespace);
  }

  @action
  reset() {
    super.reset();
    this.contextNs.clear();
  }

  async remove(item: Namespace) {
    await super.remove(item);
    this.contextNs.remove(item.getName());
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespaceStore);
