// Base class for extensions-api registries
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";

export class BaseRegistry<T, I = T> {
  private items = observable.map<T, I>();

  getItems(): I[] {
    return Array.from(this.items.values());
  }

  @action
  add(items: T | T[], extension?: LensExtension) {
    const itemArray = [items].flat() as T[];

    itemArray.forEach(item => {
      this.items.set(item, this.getRegisteredItem(item, extension));
    });

    return () => this.remove(...itemArray);
  }

  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  protected getRegisteredItem(item: T, extension?: LensExtension): I {
    return item as any;
  }

  @action
  remove(...items: T[]) {
    items.forEach(item => {
      this.items.delete(item);
    });
  }
}
