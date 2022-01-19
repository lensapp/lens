/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base class for extensions-api registries
import { action, observable, makeObservable } from "mobx";
import { Singleton } from "../../common/utils";
import type { LensExtension } from "../lens-extension";

export class BaseRegistry<T, I = T> extends Singleton {
  private items = observable.map<T, I>([], { deep: false });

  constructor() {
    super();
    makeObservable(this);
  }

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
