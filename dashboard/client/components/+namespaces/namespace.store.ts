import { action, observable, reaction } from "mobx";
import { autobind, StorageHelper } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints";
import { QueryParams, navigation, setQueryParams } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { isAllowedResource } from "../..//api/rbac";

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  contextNs = observable.array<string>();

  protected storage = new StorageHelper<string[]>("context_ns", this.contextNs);

  get initNamespaces(): string[] {
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

  getContextParams(): Partial<QueryParams> {
    return {
      namespaces: this.contextNs
    };
  }

  protected updateUrl(namespaces: string[]): void {
    setQueryParams({ namespaces }, { replace: true });
  }

  protected loadItems(namespaces?: string[]): Promise<Namespace[]> {
    if (!isAllowedResource("namespaces")) {
      if (namespaces) {
        return Promise.all(namespaces.map(name => this.getDummyNamespace(name)));
      } else {
        return new Promise<Namespace[]>(() => {
          return [];
        });
      }
    }
    if (namespaces) {
      return Promise.all(namespaces.map(name => this.api.get({ name })));
    } else {
      return super.loadItems();
    }
  }

  protected getDummyNamespace(name: string): Namespace {
    return new Namespace({
      kind: "Namespace",
      apiVersion: "v1",
      metadata: {
        name: name,
        uid: "",
        resourceVersion: "",
        selfLink: `/api/v1/namespaces/${name}`
      }
    });
  }

  setContext(namespaces: string[]): void {
    this.contextNs.replace(namespaces);
  }

  hasContext(namespace: string | string[]): boolean {
    const context = Array.isArray(namespace) ? namespace : [namespace];
    return context.every(namespace => this.contextNs.includes(namespace));
  }

  toggleContext(namespace: string): void {
    if (this.hasContext(namespace)) {
      this.contextNs.remove(namespace);
    } else {
      this.contextNs.push(namespace);
    }
  }

  @action
  reset(): void {
    super.reset();
    this.contextNs.clear();
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespacesApi, namespaceStore);
