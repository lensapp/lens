import { createStorage } from "../../utils";

export interface SidebarStorageState {
  width: number;
  compact: boolean;
  expanded: {
    [itemId: string]: boolean;
  }
}

export const sidebarStorage = createStorage<SidebarStorageState>("sidebar", {
  width: 200,     // sidebar size in non-compact mode
  compact: false, // compact-mode (icons only)
  expanded: {},
});
