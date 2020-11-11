// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";

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
  add(ext: LensExtension | null, items: T[], merge = true) {
    if (merge && this.items.has(ext)) {
      const newItems = new Set(this.items.get(ext));
      items.forEach(item => newItems.add(item))
      this.items.set(ext, [...newItems]);
    } else {
      this.items.set(ext, items);
    }
    return () => this.remove(ext, items)
  }

  @action
  remove(ext: LensExtension | null, items: T[]) {
    const storedItems = this.items.get(ext);
    if (storedItems) {
      const newItems = storedItems.filter(item => !items.includes(item)); // works because of {deep: false};
      this.items.set(ext, newItems);
    }
  }
}
