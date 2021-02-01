import { action, comparer, IReactionDisposer, IReactionOptions, observable, reaction, toJS, when } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { createPageParam } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { clusterStore, getHostedCluster } from "../../../common/cluster-store";

const storage = createStorage<string[]>("context_namespaces");

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

  @observable contextNs = observable.array<string>();
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
    return reaction(() => this.contextNs.toJS(), callback, {
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
    return reaction(() => this.allowedNamespaces, () => this.loadAll(), {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  get allowedNamespaces(): string[] {
    return toJS(getHostedCluster().allowedNamespaces);
  }

  private get initialNamespaces(): string[] {
    const allowed = new Set(this.allowedNamespaces);
    const prevSelected = storage.get();

    if (Array.isArray(prevSelected)) {
      return prevSelected.filter(namespace => allowed.has(namespace));
    }

    // otherwise select "default" or first allowed namespace
    if (allowed.has("default")) {
      return ["default"];
    } else if (allowed.size) {
      return [Array.from(allowed)[0]];
    }

    return [];
  }

  getContextNamespaces(): string[] {
    const namespaces = this.contextNs.toJS();

    // show all namespaces when nothing selected
    if (!namespaces.length) {
      if (this.isLoaded) {
        // return actual namespaces list since "allowedNamespaces" updating every 30s in cluster and thus might be stale
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
  async remove(item: Namespace) {
    await super.remove(item);
    this.contextNs.remove(item.getName());
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespaceStore);
