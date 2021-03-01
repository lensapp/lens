import { createStorage } from "../../local-storage";

export interface SidebarLocalStorageModel {
  width: number;
  compact: boolean;
  expanded: {
    [itemId: string]: boolean;
  }
}

export const sidebarLocalStorage = createStorage<SidebarLocalStorageModel>("sidebar", {
  width: 200,     // sidebar size in non-compact mode
  compact: false, // compact-mode (icons only)
  expanded: {},
});
