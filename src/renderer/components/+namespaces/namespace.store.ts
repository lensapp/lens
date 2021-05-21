/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, comparer, computed, IReactionDisposer, IReactionOptions, makeObservable, reaction, } from "mobx";
import { autoBind, createStorage, noop } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { apiManager } from "../../api/api-manager";

export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  private storage = createStorage<string[] | undefined>("selected_namespaces", undefined);

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.contextReady;
    await this.storage.whenReady;

    this.selectNamespaces(this.initialNamespaces);
    this.autoLoadAllowedNamespaces();
  }

  public onContextChange(callback: (namespaces: string[]) => void, opts: IReactionOptions = {}): IReactionDisposer {
    return reaction(() => Array.from(this.contextNamespaces), callback, {
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
    const { allowedNamespaces } = this;
    const selectedNamespaces = this.storage.get(); // raw namespaces, undefined on first load

    // return previously saved namespaces from local-storage (if any)
    if (Array.isArray(selectedNamespaces)) {
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

  @computed get selectedNamespaces(): string[] {
    return this.storage.get() ?? [];
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

  subscribe() {
    /**
     * if user has given static list of namespaces let's not start watches
     * because watch adds stuff that's not wanted or will just fail
     */
    if (this.context?.cluster.accessibleNamespaces.length > 0) {
      return noop;
    }

    return super.subscribe();
  }

  protected async loadItems(params: KubeObjectStoreLoadingParams<Namespace>): Promise<Namespace[]> {
    const { allowedNamespaces } = this;

    let namespaces = await super.loadItems(params).catch(() => []);

    namespaces = namespaces.filter(namespace => allowedNamespaces.includes(namespace.getName()));

    if (!namespaces.length && allowedNamespaces.length > 0) {
      return allowedNamespaces.map(getDummyNamespace);
    }

    return namespaces;
  }

  @action
  selectNamespaces(namespace: string | string[]) {
    const namespaces = Array.from(new Set([namespace].flat()));

    this.storage.set(namespaces);
  }

  @action
  clearSelected(namespaces?: string | string[]) {
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
      this.clearSelected(namespaces);
    } else {
      this.selectNamespaces([this.selectedNamespaces, namespaces].flat());
    }
  }

  @action
  toggleSingle(namespace: string){
    this.clearSelected();
    this.selectNamespaces(namespace);
  }

  @action
  toggleAll(showAll?: boolean) {
    if (typeof showAll === "boolean") {
      if (showAll) {
        this.selectNamespaces(this.allowedNamespaces);
      } else {
        this.selectNamespaces([]); // empty context considered as "All namespaces"
      }
    } else {
      this.toggleAll(!this.hasAllContexts);
    }
  }

  @action
  async remove(item: Namespace) {
    await super.remove(item);
    this.clearSelected(item.getName());
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
