import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTabData, TabKind } from "./dock.store";

@autobind()
export class CreateResourceStore extends DockTabStore<string> {
  constructor() {
    super({
      storageName: "create_resource"
    });
  }
}

export const createResourceStore = new CreateResourceStore();

export function createResourceTab(tabParams: Partial<DockTabData> = {}): DockTabData {
  return dockStore.createTab({
    kind: TabKind.CREATE_RESOURCE,
    title: "Create resource",
    ...tabParams
  });
}

export function isCreateResourceTab(tab: DockTabData): boolean {
  return tab?.kind === TabKind.CREATE_RESOURCE;
}
