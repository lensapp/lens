import { action, comparer, computed, IReactionDisposer, IReactionOptions, observable, reaction, toJS, when } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { createPageParam } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { clusterStore, getHostedCluster } from "../../../common/cluster-store";

const storage = createStorage<string[]>("context_namespaces", []);

export const namespaceUrlParam = createPageParam<string[]>({
  name: "namespaces",
  isSystem: true,
  multiValues: true,
  get defaultValue() {
    return storage.get() ?? []; // initial namespaces coming from URL or local-storage (default)
  }
});

export function getDummyNamespace(name: string) {
  return new Namespace({
    kind: Namespace.kind,
    apiVersion: "v1",
    metadata: {
      name,
      uid: "",
      resourceVersion: "",
      selfLink: `/api/v1/namespaces/${name}`
    }
  });
}

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;

  @observable private contextNs = observable.set<string>();
  @observable isReady = false;

  whenReady = when(() => this.isReady);

  constructor() {
    super();
    this.init();
  }

  private async init() {
    await clusterStore.whenLoaded;
    if (!getHostedCluster()) return;
    await getHostedCluster().whenReady; // wait for cluster-state from main

    this.setContext(this.initialNamespaces);
    this.autoLoadAllowedNamespaces();
    this.autoUpdateUrlAndLocalStorage();

    this.isReady = true;
  }

  public onContextChange(callback: (contextNamespaces: string[]) => void, opts: IReactionOptions = {}): IReactionDisposer {
    return reaction(() => Array.from(this.contextNs), callback, {
      equals: comparer.shallow,
      ...opts,
    });
  }

  private autoUpdateUrlAndLocalStorage(): IReactionDisposer {
    return this.onContextChange(namespaces => {
      storage.set(namespaces); // save to local-storage
      namespaceUrlParam.set(namespaces, { replaceHistory: true }); // update url
    }, {
      fireImmediately: true,
    });
  }

  private autoLoadAllowedNamespaces(): IReactionDisposer {
    return reaction(() => this.allowedNamespaces, namespaces => this.loadAll(namespaces), {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  @computed get allowedNamespaces(): string[] {
    return toJS(getHostedCluster().allowedNamespaces);
  }

  @computed
  private get initialNamespaces(): string[] {
    const namespaces = new Set(this.allowedNamespaces);
    const prevSelected = storage.get().filter(namespace => namespaces.has(namespace));

    // return previously saved namespaces from local-storage
    if (prevSelected.length > 0) {
      return prevSelected;
    }

    // otherwise select "default" or first allowed namespace
    if (namespaces.has("default")) {
      return ["default"];
    } else if (namespaces.size) {
      return [Array.from(namespaces)[0]];
    }

    return [];
  }

  getContextNamespaces(): string[] {
    const namespaces = Array.from(this.contextNs);

    // show all namespaces when nothing selected
    if (!namespaces.length) {
      // return actual namespaces list since "allowedNamespaces" updating every 30s in cluster and thus might be stale
      if (this.isLoaded) {
        return this.items.map(namespace => namespace.getName());
      }

      return this.allowedNamespaces;
    }

    return namespaces;
  }

  getSubscribeApis() {
    const { accessibleNamespaces } = getHostedCluster();

    // if user has given static list of namespaces let's not start watches because watch adds stuff that's not wanted
    if (accessibleNamespaces.length > 0) {
      return [];
    }

    return super.getSubscribeApis();
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams) {
    const { allowedNamespaces } = this;

    let namespaces = await super.loadItems(params);

    namespaces = namespaces.filter(namespace => allowedNamespaces.includes(namespace.getName()));

    if (!namespaces.length && allowedNamespaces.length > 0) {
      return allowedNamespaces.map(getDummyNamespace);
    }

    return namespaces;
  }

  @action
  setContext(namespace: string | string[]) {
    const namespaces = [namespace].flat();

    this.contextNs.replace(namespaces);
  }

  @action
  resetContext() {
    this.contextNs.clear();
  }

  hasContext(namespaces: string | string[]) {
    return [namespaces].flat().every(namespace => this.contextNs.has(namespace));
  }

  @computed get hasAllContexts(): boolean {
    return this.contextNs.size === this.allowedNamespaces.length;
  }

  @action
  toggleContext(namespace: string) {
    if (this.hasContext(namespace)) {
      this.contextNs.delete(namespace);
    } else {
      this.contextNs.add(namespace);
    }
  }

  @action
  toggleAll(showAll?: boolean) {
    if (typeof showAll === "boolean") {
      if (showAll) {
        this.setContext(this.allowedNamespaces);
      } else {
        this.contextNs.clear();
      }
    } else {
      this.toggleAll(!this.hasAllContexts);
    }
  }

  @action
  async remove(item: Namespace) {
    await super.remove(item);
    this.contextNs.delete(item.getName());
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespaceStore);
