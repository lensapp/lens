// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";
import { recitfy } from "../../common/utils";

export class BaseRegistry<T> {
  private items = observable<T>([], { deep: false });

  getItems(): T[] {
    return this.items.toJS();
  }

  add(items: T | T[], ext?: LensExtension): () => void; // allow method overloading with required "ext"
  @action
  add(items: T | T[]) {
    const itemArray = recitfy(items);
    this.items.push(...itemArray);
    return () => this.remove(...itemArray);
  }

  @action
  remove(...items: T[]) {
    items.forEach(item => {
      this.items.remove(item); // works because of {deep: false};
    });
  }
}
