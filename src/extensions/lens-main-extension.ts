/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LensExtension } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import { catalogEntityRegistry } from "../main/catalog";
import type { CatalogEntity } from "../common/catalog";
import type { IObservableArray } from "mobx";
import type { MenuRegistration } from "../main/menu/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];
  trayMenus: TrayMenuRegistration[] = [];

  async navigate(pageId?: string, params?: Record<string, any>, frameId?: number) {
    return WindowManager.getInstance().navigateExtension(this.id, pageId, params, frameId);
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    catalogEntityRegistry.addObservableSource(`${this.name}:${id}`, source);
  }

  removeCatalogSource(id: string) {
    catalogEntityRegistry.removeSource(`${this.name}:${id}`);
  }
}
