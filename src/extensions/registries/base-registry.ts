// Base class for extensions-api registries
import { action, observable } from "mobx";

export class BaseRegistry<T = any> {
  private items = observable<T>([], { deep: false });

  getItems(): T[] {
    return this.items.toJS();
  }

  @action
  add(items: T | T[]) {
    const normalizedItems = (Array.isArray(items) ? items : [items])
    this.items.push(...normalizedItems);
    return () => this.remove(...normalizedItems);
  }

  @action
  remove(...items: T[]) {
    items.forEach(item => {
      this.items.remove(item); // works because of {deep: false};
    })
  }
}
