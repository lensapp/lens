import { autobind, noop } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { autorun, IReactionDisposer } from "mobx";
import { dockStore, IDockTab, TabId, TabKind } from "./dock.store";
import { KubeObject } from "../../api/kube-object";
import { apiManager } from "../../api/api-manager";
import { KubeObjectStore } from "../../kube-object.store";

export interface EditingResource {
  resource: string; // resource path, e.g. /api/v1/namespaces/default
  draft?: string; // edited draft in yaml
}

@autobind()
export class EditResourceStore extends DockTabStore<EditingResource> {
  private watchers = new Map<TabId, IReactionDisposer>();

  constructor() {
    super({
      storageKey: "edit_resource_store",
    });
  }

  protected async init() {
    super.init();
    await this.storage.whenReady;

    autorun(() => {
      Array.from(this.data).forEach(([tabId, { resource }]) => {
        if (this.watchers.get(tabId)) {
          return;
        }
        this.watchers.set(tabId, autorun(() => {
          const store = apiManager.getStore(resource);

          if (store) {
            const isActiveTab = dockStore.isOpen && dockStore.selectedTabId === tabId;
            const obj = store.getByPath(resource);

            // preload resource for editing
            if (!obj && !store.isLoaded && !store.isLoading && isActiveTab) {
              store.loadFromPath(resource).catch(noop);
            }
            // auto-close tab when resource removed from store
            else if (!obj && store.isLoaded) {
              dockStore.closeTab(tabId);
            }
          }
        }, {
          delay: 100 // make sure all kube-object stores are initialized
        }));
      });
    });
  }

  protected finalizeDataForSave({ draft, ...data }: EditingResource): EditingResource {
    return data; // skip saving draft to local-storage
  }

  isReady(tabId: TabId) {
    const tabDataReady = super.isReady(tabId);

    return Boolean(tabDataReady && this.getResource(tabId)); // ready to edit resource
  }

  getStore(tabId: TabId): KubeObjectStore | undefined {
    return apiManager.getStore(this.getResourcePath(tabId));
  }

  getResource(tabId: TabId): KubeObject | undefined {
    return this.getStore(tabId)?.getByPath(this.getResourcePath(tabId));
  }

  getResourcePath(tabId: TabId): string | undefined {
    return this.getData(tabId)?.resource;
  }

  getTabByResource(object: KubeObject): IDockTab {
    const [tabId] = Array.from(this.data).find(([, { resource }]) => {
      return object.selfLink === resource;
    }) || [];

    return dockStore.getTabById(tabId);
  }

  reset() {
    super.reset();
    Array.from(this.watchers).forEach(([tabId, dispose]) => {
      this.watchers.delete(tabId);
      dispose();
    });
  }
}

export const editResourceStore = new EditResourceStore();

export function editResourceTab(object: KubeObject, tabParams: Partial<IDockTab> = {}) {
  // use existing tab if already opened
  let tab = editResourceStore.getTabByResource(object);

  if (tab) {
    dockStore.open();
    dockStore.selectTab(tab.id);
  }

  // or create new tab
  if (!tab) {
    tab = dockStore.createTab({
      title: `${object.kind}: ${object.getName()}`,
      kind: TabKind.EDIT_RESOURCE,
      ...tabParams
    }, false);
    editResourceStore.setData(tab.id, {
      resource: object.selfLink,
    });
  }

  return tab;
}

export function isEditResourceTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.EDIT_RESOURCE;
}
