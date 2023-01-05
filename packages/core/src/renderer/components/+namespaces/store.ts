/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue, IReactionDisposer } from "mobx";
import { action, comparer, computed, makeObservable, reaction } from "mobx";
import type { StorageLayer } from "../../utils";
import { autoBind, noop, toggle } from "../../utils";
import type { KubeObjectStoreDependencies, KubeObjectStoreLoadingParams } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { NamespaceApi } from "../../../common/k8s-api/endpoints/namespace.api";
import { Namespace } from "../../../common/k8s-api/endpoints/namespace.api";

interface Dependencies extends KubeObjectStoreDependencies {
  readonly storage: StorageLayer<string[] | undefined>;
  readonly clusterConfiguredAccessibleNamespaces: IComputedValue<string[]>;
}

export class NamespaceStore extends KubeObjectStore<Namespace, NamespaceApi> {
  constructor(protected readonly dependencies: Dependencies, api: NamespaceApi) {
    super(dependencies, api);
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.dependencies.storage.whenReady;

    const { allowedNamespaces } = this;
    const selectedNamespaces = this.dependencies.storage.get(); // raw namespaces, undefined on first load

    // return previously saved namespaces from local-storage (if any)
    if (Array.isArray(selectedNamespaces)) {
      this.selectNamespaces(selectedNamespaces.filter(namespace => allowedNamespaces.includes(namespace)));
    } else if (allowedNamespaces.includes("default")) {
      this.selectNamespaces(["default"]);
    } else if (allowedNamespaces.length) {
      this.selectNamespaces([allowedNamespaces[0]]);
    } else {
      this.selectNamespaces([]);
    }
  }

  public onContextChange(callback: (namespaces: string[]) => void, opts: { fireImmediately?: boolean } = {}): IReactionDisposer {
    return reaction(() => Array.from(this.contextNamespaces), callback, {
      fireImmediately: opts.fireImmediately,
      equals: comparer.shallow,
    });
  }

  /**
   * @private
   * The current value (list of namespaces names) in the storage layer
   */
  @computed private get selectedNamespaces() {
    return this.dependencies.storage.get() ?? [];
  }

  @computed get allowedNamespaces(): string[] {
    return this.items.map(item => item.getName());
  }

  /**
   * The list of selected namespace names (for filtering)
   */
  @computed get contextNamespaces() {
    if (!this.selectedNamespaces.length) {
      return this.allowedNamespaces; // show all namespaces when nothing selected
    }

    return this.selectedNamespaces;
  }

  /**
   * The set of select namespace names (for filtering)
   */
  @computed get selectedNames(): Set<string> {
    return new Set(this.contextNamespaces);
  }

  /**
   * Is true when the the set of namespace names selected is implicitly all
   *
   * Namely, this will be true if the user has deselected all namespaces from
   * the filter or if the user has clicked the "All Namespaces" option
   */
  @computed get areAllSelectedImplicitly(): boolean {
    return this.selectedNamespaces.length === 0;
  }

  subscribe() {
    const clusterConfiguredAccessibleNamespaces = this.dependencies.clusterConfiguredAccessibleNamespaces.get();

    /**
     * if user has given static list of namespaces let's not start watches
     * because watch adds stuff that's not wanted or will just fail
     */
    if (clusterConfiguredAccessibleNamespaces.length > 0) {
      return noop;
    }

    return super.subscribe();
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams): Promise<Namespace[]> {
    const clusterConfiguredAccessibleNamespaces = this.dependencies.clusterConfiguredAccessibleNamespaces.get();

    if (clusterConfiguredAccessibleNamespaces.length > 0) {
      return clusterConfiguredAccessibleNamespaces.map(getDummyNamespace);
    }

    return super.loadItems(params);
  }

  @action selectNamespaces = (namespace: string | string[]) => {
    const namespaces = Array.from(new Set([namespace].flat()));

    this.dependencies.storage.set(namespaces);
  };

  @action
  clearSelected(namespaces?: string | string[]) {
    if (namespaces) {
      const resettingNamespaces = [namespaces].flat();
      const newNamespaces = this.dependencies.storage.get()?.filter(ns => !resettingNamespaces.includes(ns));

      this.dependencies.storage.set(newNamespaces);
    } else {
      this.dependencies.storage.reset();
    }
  }

  /**
   * Checks if namespace names are selected for filtering
   * @param namespaces One or several names of namespaces to check if they are selected
   * @returns `true` if all the provided names are selected
   */
  hasContext(namespaces: string | string[]): boolean {
    return [namespaces]
      .flat()
      .every(namespace => this.selectedNames.has(namespace));
  }

  /**
   * Is `true` if all available namespaces are selected, otherwise `false`
   */
  @computed get hasAllContexts(): boolean {
    return this.contextNamespaces.length === this.allowedNamespaces.length;
  }

  /**
   * Acts like `toggleSingle` but can work on several at a time
   * @param namespaces One or many names of namespaces to select
   */
  @action
  toggleContext(namespaces: string | string[]) {
    const nextState = new Set(this.contextNamespaces);

    for (const namespace of [namespaces].flat()) {
      toggle(nextState, namespace);
    }

    this.dependencies.storage.set([...nextState]);
  }

  /**
   * Toggles the selection state of `namespace`. Namely, if it was previously
   * specifically or implicitly selected then after this call it will be
   * explicitly deselected.
   * @param namespace The name of a namespace
   */
  toggleSingle(namespace: string) {
    const nextState = new Set(this.contextNamespaces);

    toggle(nextState, namespace);
    this.dependencies.storage.set([...nextState]);
  }

  /**
   * Makes the given namespace the sole selected namespace
   */
  selectSingle(namespace: string) {
    this.dependencies.storage.set([namespace]);
  }

  /**
   * Selects all available namespaces.
   *
   * Note: If new namespaces appear in the future those will be selected too
   */
  selectAll() {
    this.selectNamespaces([]);
  }

  /**
   * This function selects all namespaces implicitly.
   *
   * NOTE: does not toggle any namespaces
   * @param selectAll NOT USED
   * @deprecated Use `NamespaceStore.selectAll` instead.
   */
  toggleAll(selectAll?: boolean) {
    void selectAll;
    this.selectAll();
  }

  @action
  async remove(item: Namespace) {
    await super.remove(item);
    this.clearSelected(item.getName());
  }
}

export function getDummyNamespace(name: string) {
  return new Namespace({
    kind: Namespace.kind,
    apiVersion: "v1",
    metadata: {
      name,
      uid: "",
      resourceVersion: "",
      selfLink: `/api/v1/namespaces/${name}`,
    },
  });
}
