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

import { Disposers, LensExtension } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import { catalogEntityRegistry, EntityFilter } from "../main/catalog";
import type { CatalogEntity } from "../common/catalog";
import type { IObservableArray } from "mobx";
import type { MenuRegistration } from "./registries";
import type { Disposer } from "../common/utils";

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];

  async navigate(pageId?: string, params?: Record<string, any>, frameId?: number) {
    return WindowManager.getInstance().navigateExtension(this.id, pageId, params, frameId);
  }

  /**
   * Add a filtering function for the catalog. This will be removed if the extension is disabled.
   * @param fn The function which should return a truthy value for those entities which should be kepted
   * @returns A function to clean up the filter
   */
  addCatalogFilter(fn: EntityFilter): Disposer {
    const dispose = catalogEntityRegistry.addCatalogFilter(fn);

    this[Disposers].push(dispose);

    return dispose;
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    catalogEntityRegistry.addObservableSource(`${this.name}:${id}`, source);
  }

  removeCatalogSource(id: string) {
    catalogEntityRegistry.removeSource(`${this.name}:${id}`);
  }
}
