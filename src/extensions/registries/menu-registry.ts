// Extensions API -> Global menu customize

import { observable } from "mobx";
import { MenuItemConstructorOptions } from "electron";
import type { MenuTopId } from "../../main/menu";

export interface MenuRegistration extends MenuItemConstructorOptions {
  parentId?: MenuTopId;
}

export class MenuRegistry {
  protected items = observable.array([], { deep: false });

  getItems(): MenuRegistration[] {
    return this.items.toJS();
  }

  add(item: MenuRegistration) {
    this.items.push(item);
    return () => this.items.remove(item)
  }
}

export const menuRegistry = new MenuRegistry();
