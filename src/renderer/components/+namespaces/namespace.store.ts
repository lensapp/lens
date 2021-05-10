import { action, comparer, computed, IReactionDisposer, IReactionOptions, makeObservable, reaction, when, } from "mobx";
import { autoBind, createStorage } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { apiManager } from "../../api/api-manager";

export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;

  private defaultNamespaces: string[] = [];
  private storage = createStorage<string[]>("selected_namespaces", this.defaultNamespaces);

  @computed get selectedNamespaces(): string[] {
    return this.storage.get();
  }

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.contextReady;
    await when(() => this.storage.initialized);

    this.setContext(this.initialNamespaces);
    this.autoLoadAllowedNamespaces();
  }

  public onContextChange(callback: (namespaces: string[]) => void, opts: IReactionOptions = {}): IReactionDisposer {
    return reaction(() => Array.from(this.selectedNamespaces), callback, {
      equals: comparer.shallow,
      ...opts,
    });
  }

  private autoLoadAllowedNamespaces(): IReactionDisposer {
    return reaction(() => this.allowedNamespaces, namespaces => this.loadAll({ namespaces }), {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  private get initialNamespaces(): string[] {
    const { allowedNamespaces, selectedNamespaces, defaultNamespaces } = this;

    // return previously saved namespaces from local-storage (if any)
    if (selectedNamespaces !== defaultNamespaces) {
      return selectedNamespaces.filter(namespace => allowedNamespaces.includes(namespace));
    }

    // otherwise select "default" or first allowed namespace
    if (allowedNamespaces.includes("default")) {
      return ["default"];
    } else if (allowedNamespaces.length) {
      return [allowedNamespaces[0]];
    }

    return [];
  }

  @computed get allowedNamespaces(): string[] {
    return Array.from(new Set([
      ...(this.context?.allNamespaces ?? []), // allowed namespaces from cluster (main), updating every 30s
      ...this.items.map(item => item.getName()), // loaded namespaces from k8s api
    ].flat()));
  }

  @computed get contextNamespaces(): string[] {
    if (!this.selectedNamespaces.length) {
      return this.allowedNamespaces; // show all namespaces when nothing selected
    }

    return this.selectedNamespaces;
  }

  getSubscribeApis() {
    // if user has given static list of namespaces let's not start watches because watch adds stuff that's not wanted
    if (this.context?.cluster.accessibleNamespaces.length > 0) {
      return [];
    }

    return super.getSubscribeApis();
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams) {
    const { allowedNamespaces } = this;

    let namespaces = (await super.loadItems(params)) || [];

    namespaces = namespaces.filter(namespace => allowedNamespaces.includes(namespace.getName()));

    if (!namespaces.length && allowedNamespaces.length > 0) {
      return allowedNamespaces.map(getDummyNamespace);
    }

    return namespaces;
  }

  @action
  setContext(namespace: string | string[]) {
    const namespaces = Array.from(new Set([namespace].flat()));

    this.storage.set(namespaces);
  }

  @action
  resetContext(namespaces?: string | string[]) {
    if (namespaces) {
      const resettingNamespaces = [namespaces].flat();
      const newNamespaces = this.storage.get().filter(ns => !resettingNamespaces.includes(ns));

      this.storage.set(newNamespaces);
    } else {
      this.storage.reset();
    }
  }

  hasContext(namespaces: string | string[]): boolean {
    return [namespaces]
      .flat()
      .every(namespace => this.selectedNamespaces.includes(namespace));
  }

  @computed get hasAllContexts(): boolean {
    return this.selectedNamespaces.length === this.allowedNamespaces.length;
  }

  @action
  toggleContext(namespaces: string | string[]) {
    if (this.hasContext(namespaces)) {
      this.resetContext(namespaces);
    } else {
      this.setContext([this.selectedNamespaces, namespaces].flat());
    }
  }

  @action
  toggleAll(showAll?: boolean) {
    if (typeof showAll === "boolean") {
      if (showAll) {
        this.setContext(this.allowedNamespaces);
      } else {
        this.resetContext(); // empty context considered as "All namespaces"
      }
    } else {
      this.toggleAll(!this.hasAllContexts);
    }
  }

  @action
  async remove(item: Namespace) {
    await super.remove(item);
    this.resetContext(item.getName());
  }
}

export const namespaceStore = new NamespaceStore();
apiManager.registerStore(namespaceStore);

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
