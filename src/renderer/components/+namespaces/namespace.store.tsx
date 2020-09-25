import React from "react";
import { action, computed, observable, ObservableSet, reaction } from "mobx";
import { autobind, createStorage } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { Namespace, namespacesApi } from "../../api/endpoints";
import { IQueryParams, navigation, setQueryParams } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { isAllowedResource } from "../../../common/rbac";
import { Icon } from "../icon";

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  contextNs = observable.set<string>();

  protected storage = createStorage<Set<string>>("context_ns", this.contextNs, {
    parse(from: string) {
      return new Set(JSON.parse(from))
    },
    stringify(from: Set<string>) {
      return JSON.stringify([...from.values()])
    }
  });

  constructor() {
    super();

    // restore context namespaces
    const fromUrl = navigation.searchParams.getAsArray("namespaces")
    const namespaces = fromUrl.length ? fromUrl : this.storage.get();
    this.context = [...namespaces];
    this.updateUrl(...namespaces);

    // sync with local-storage & url-search-params
    reaction(() => this.contextNs.toJS(), namespaces => {
      this.storage.set(namespaces);
      this.updateUrl(...namespaces.values());
    });
  }

  @computed
  get contextParams(): IQueryParams {
    const namespaces = [...this.contextNs.values()]
    return { namespaces }
  }

  protected updateUrl(...namespaces: string[]) {
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

  @action
  set context(namespaces: string[]) {
    this.contextNs.replace(namespaces);
  }

  @action
  hasContext(namespace: string | string[]) {
    const context = Array.isArray(namespace) ? namespace : [namespace];
    return context.every(namespace => this.contextNs.has(namespace));
  }

  @action
  toggleContext(namespace: string) {
    if (this.contextNs.has(namespace)) {
      this.contextNs.delete(namespace)
    } else {
      this.contextNs.add(namespace)
    }
  }

  @computed
  get Options() {
    return this.items.map(namespace => ({
      value: namespace.getName(),
      label: (
        <div className="flex gaps align-center">
          <Icon small material="layers" className="always-visible" />
          <span>{namespace.getName()}</span>
          <Icon small material="check" className="box right" />
        </div>
      ),
    }))
  }

  @computed
  get SelectedValues() {
    return this.Options.filter(({ value }) => this.contextNs.has(value))
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
apiManager.registerStore(namespacesApi, namespaceStore);
