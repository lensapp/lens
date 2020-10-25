// Base class for extensions-api registries
import { observable } from "mobx";

export class BaseRegistry<T = any> {
  protected items = observable<T>([], { deep: false });

  getItems(): T[] {
    return this.items.toJS();
  }

  add(item: T) {
    this.items.push(item);
    return () => {
      this.items.remove(item); // works because of {deep: false};
    }
  }
}
