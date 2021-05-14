/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Base class for extensions-api registries
import { action, observable, makeObservable } from "mobx";
import { Singleton } from "../../common/utils";
import { LensExtension } from "../lens-extension";

export class BaseRegistry<T, I = T> extends Singleton {
  private items = observable.map<T, I>([], {deep: false});

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
