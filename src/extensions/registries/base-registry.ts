// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";

export class BaseRegistry<T = object, I extends T = T> {
  private items = observable<T>([], { deep: false });

  getItems(): I[] {
    return this.items.toJS() as I[];
  }

  add(items: T | T[], ext?: LensExtension): () => void; // allow method overloading with required "ext"
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
