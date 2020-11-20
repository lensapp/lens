// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";

export class BaseRegistry<T> {
  private items = observable<T>([], { deep: false });

  getItems(): T[] {
    return this.items.toJS();
  }

  add(items: T[], ext?: LensExtension): () => void; // allow method overloading with required "ext"
  @action
  add(items: T[]) {
    this.items.push(...items);
    return () => this.remove(...items);
  }

  @action
  remove(...items: T[]) {
    items.forEach(item => {
      this.items.remove(item); // works because of {deep: false};
    });
  }
}
