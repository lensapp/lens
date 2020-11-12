// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";
import { getRandId } from "../../common/utils";

export type BaseRegistryKey = LensExtension | null;
export type BaseRegistryItemId = string | symbol;

export interface BaseRegistryItem {
  id?: BaseRegistryItemId; // uniq id, generated automatically when not provided
}

export interface BaseRegistryAddMeta {
  key?: BaseRegistryKey;
  merge?: boolean
}

export class BaseRegistry<T extends BaseRegistryItem = any> {
  private items = observable.map<BaseRegistryKey, T[]>([], { deep: false });

  getItems(): (T & { extension?: LensExtension | null })[] {
    return Array.from(this.items).map(([ext, items]) => {
      return items.map(item => ({
        ...item,
        extension: ext,
      }))
    }).flat()
  }

  getById(itemId: BaseRegistryItemId, key?: BaseRegistryKey): T {
    const byId = (item: BaseRegistryItem) => item.id === itemId;
    if (key) {
      return this.items.get(key)?.find(byId)
    }
    return this.getItems().find(byId);
  }

  @action
  add(items: T | T[], { key = null, merge = true }: BaseRegistryAddMeta = {}) {
    const normalizedItems = (Array.isArray(items) ? items : [items]).map((item: T) => {
      item.id = item.id || getRandId();
      return item;
    });
    if (merge && this.items.has(key)) {
      const newItems = new Set(this.items.get(key));
      normalizedItems.forEach(item => newItems.add(item))
      this.items.set(key, [...newItems]);
    } else {
      this.items.set(key, normalizedItems);
    }
    return () => this.remove(normalizedItems, key)
  }

  @action
  remove(items: T[], key: BaseRegistryKey = null) {
    const storedItems = this.items.get(key);
    if (!storedItems) return;
    const newItems = storedItems.filter(item => !items.includes(item)); // works because of {deep: false};
    if (newItems.length > 0) {
      this.items.set(key, newItems)
    } else {
      this.items.delete(key);
    }
  }
}
