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

import { action, comparer, computed, IReactionDisposer, IReactionOptions, observable, reaction } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore, KubeObjectStoreLoadingParams } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints/namespaces.api";
import { createPageParam } from "../../navigation";
import { apiManager } from "../../api/api-manager";

const selectedNamespaces = createStorage<string[] | undefined>("selected_namespaces", undefined);

export const namespaceUrlParam = createPageParam<string[]>({
  name: "namespaces",
  isSystem: true,
  multiValues: true,
  defaultValue: [],
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

  constructor() {
    super();
    this.init();
  }

  private async init() {
    await this.contextReady;
    await selectedNamespaces.whenReady;

    this.setContext(this.initialNamespaces);
    this.autoLoadAllowedNamespaces();
    this.autoUpdateUrlAndLocalStorage();
  }

  public onContextChange(callback: (contextNamespaces: string[]) => void, opts: IReactionOptions = {}): IReactionDisposer {
    return reaction(() => Array.from(this.contextNs), callback, {
      equals: comparer.shallow,
      ...opts,
    });
  }

  private autoUpdateUrlAndLocalStorage(): IReactionDisposer {
    return this.onContextChange(namespaces => {
      selectedNamespaces.set(namespaces); // save to local-storage
      namespaceUrlParam.set(namespaces, { replaceHistory: true }); // update url
    }, {
      fireImmediately: true,
    });
  }

  private autoLoadAllowedNamespaces(): IReactionDisposer {
    return reaction(() => this.allowedNamespaces, namespaces => this.loadAll({ namespaces }), {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  private get initialNamespaces(): string[] {
    const namespaces = new Set(this.allowedNamespaces);
    const prevSelectedNamespaces = selectedNamespaces.get();

    // return previously saved namespaces from local-storage (if any)
    if (prevSelectedNamespaces) {
      return prevSelectedNamespaces.filter(namespace => namespaces.has(namespace));
    }

    // otherwise select "default" or first allowed namespace
    if (namespaces.has("default")) {
      return ["default"];
    } else if (namespaces.size) {
      return [Array.from(namespaces)[0]];
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
    const namespaces = Array.from(this.contextNs);

    if (!namespaces.length) {
      return this.allowedNamespaces; // show all namespaces when nothing selected
    }

    return namespaces;
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
        this.resetContext(); // empty context considered as "All namespaces"
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
