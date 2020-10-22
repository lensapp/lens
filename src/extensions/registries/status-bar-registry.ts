// Extensions API -> Status bar customizations

import { observable } from "mobx";

export interface StatusBarRegistration {
}

export class StatusBarRegistry {
  items = observable<StatusBarRegistration>([], { deep: false });

  add(item: StatusBarRegistration) {
  }
}

export const statusBarRegistry = new StatusBarRegistry();
