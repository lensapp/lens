import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";

@autobind()
export class CreateResourceStore extends DockTabStore<string> {
  constructor() {
    super({
      storageName: "create_resource"
    });
  }
}

export const createResourceStore = new CreateResourceStore();

export function createResourceTab(tabParams: Partial<IDockTab> = {}) {
  return dockStore.createTab({
    kind: TabKind.CREATE_RESOURCE,
    title: "Create resource",
    ...tabParams
  });
}

export function isCreateResourceTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.CREATE_RESOURCE;
}
