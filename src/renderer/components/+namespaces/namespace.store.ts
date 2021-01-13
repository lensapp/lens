import { debounce } from "lodash";
import { action, comparer, IReactionDisposer, IReactionOptions, observable, reaction, toJS, when } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { createPageParam } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { isAllowedResource } from "../../../common/rbac";
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
    this.isReady = true;

    this.setContext(this.initialNamespaces);
    this.autoLoadAllowedNamespaces();
    this.autoUpdateUrlAndLocalStorage();
  }

  public onContextChange(callback: (contextNamespaces: string[]) => void, opts: IReactionOptions = {}): IReactionDisposer {
    return reaction(() => this.contextNs.toJS(), callback, {
      equals: comparer.identity,
      ...opts,
    });
  }

  private autoUpdateUrlAndLocalStorage(): IReactionDisposer {
    return this.onContextChange(namespaces => {
      storage.set(namespaces); // save to local-storage
      namespaceUrlParam.set(namespaces, { replaceHistory: true }); // update url
    }, {
      fireImmediately: true,
      equals: comparer.identity,
    });
  }

  private autoLoadAllowedNamespaces(): IReactionDisposer {
    return reaction(() => this.allowedNamespaces, () => this.loadAll(), {
      fireImmediately: true,
      equals: comparer.identity,
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

    if (!namespaces.length) {
      return [...this.allowedNamespaces]; // show all namespaces when nothing selected
    }

    return namespaces;
  }

  subscribe(apis = [this.api]) {
    const { accessibleNamespaces } = getHostedCluster();

    // if user has given static list of namespaces let's not start watches because watch adds stuff that's not wanted
    if (accessibleNamespaces.length > 0) {
      return Function; // no-op
    }

    return super.subscribe(apis);
  }

  // prevent multiple loading from different sources (e.g. items-list-layout, namespace-select)
  private loadAllLazy = debounce(() => {
    super.loadAll({
      namespaces: this.allowedNamespaces,
    });
  }, 250);

  async loadAll() {
    this.loadAllLazy();
  }

  protected async loadItems({ namespaces }: KubeObjectStoreLoadingParams) {
    if (!isAllowedResource("namespaces")) {
      return namespaces.map(getDummyNamespace);
    }

    return Promise.all(namespaces.map(name => this.api.get({ name })));
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
