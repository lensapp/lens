// Base class for extensions-api registries
import { action, observable } from "mobx";

export class BaseRegistry<T = any> {
  protected items = observable<T>([], { deep: false });

  getItems(): T[] {
    return this.items.toJS();
  }

  @action
  add(...items: T[]) {
    this.items.push(...items);
    return () => this.remove(...items);
  }

  @action
  remove(...items: T[]) {
    items.forEach(item => {
      this.items.remove(item); // works because of {deep: false};
    })
  }
}
