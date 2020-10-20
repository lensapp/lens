// Extensions API -> Global menu customize

import { observable } from "mobx";

export interface MenuRegistration {
  data?: any;
}

export class MenuRegistry {
  items = observable<MenuRegistration>([], { deep: false });

  add(item: MenuRegistration) {
  }
}

export const menuRegistry = new MenuRegistry();
