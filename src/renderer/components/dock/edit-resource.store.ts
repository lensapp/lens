import { autobind, noop } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { autorun, IReactionDisposer } from "mobx";
import { dockStore, IDockTab, TabKind } from "./dock.store";
import { KubeObject } from "../../api/kube-object";
import { apiManager } from "../../api/api-manager";

export interface KubeEditResource {
  resource: string; // resource path, e.g. /api/v1/namespaces/default
  draft?: string; // edited draft in yaml
}

@autobind()
export class EditResourceStore extends DockTabStore<KubeEditResource> {
  private watchers = new Map<string /*tabId*/, IReactionDisposer>();

  constructor() {
    super({
      storageName: "edit_resource_store",
      storageSerializer: ({ draft, ...data }) => data, // skip saving draft in local-storage
    });

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
          delay: 100 // make sure all stores initialized
        }));
      })
    });
  }

  getTabByResource(object: KubeObject): IDockTab {
    const [tabId] = Array.from(this.data).find(([tabId, { resource }]) => {
      return object.selfLink === resource;
    }) || [];
    return dockStore.getTabById(tabId);
  }

  reset() {
    super.reset();
    Array.from(this.watchers).forEach(([tabId, dispose]) => {
      this.watchers.delete(tabId);
      dispose();
    })
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