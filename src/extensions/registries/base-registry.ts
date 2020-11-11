// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";

export interface BaseRegistryAddMeta {
  ext?: LensExtension | null;
  merge?: boolean
}

export class BaseRegistry<T extends object = any> {
  private items = observable.map<LensExtension, T[]>([], { deep: false });

  getItems(): (T & { extension?: LensExtension })[] {
    return Array.from(this.items).map(([ext, items]) => {
      return items.map(item => ({
        ...item,
        extension: ext,
      }))
    }).flat()
  }

  @action
  add(items: T | T[], { ext = null, merge = true }: BaseRegistryAddMeta = {}) {
    const itemsList: T[] = Array.isArray(items) ? items : [items];
    if (merge && this.items.has(ext)) {
      const newItems = new Set(this.items.get(ext));
      itemsList.forEach(item => newItems.add(item))
      this.items.set(ext, [...newItems]);
    } else {
      this.items.set(ext, itemsList);
    }
    return () => this.remove(itemsList, ext)
  }

  @action
  remove(items: T[], key: LensExtension = null) {
    const storedItems = this.items.get(key);
    if (storedItems) {
      const newItems = storedItems.filter(item => !items.includes(item)); // works because of {deep: false};
      if (newItems.length > 0) {
        this.items.set(key, newItems)
      } else {
        this.items.delete(key);
      }
    }
  }
}
