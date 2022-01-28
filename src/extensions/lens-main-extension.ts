/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LensExtension } from "./lens-extension";
import type { CatalogEntity } from "../common/catalog";
import { computed, IComputedValue, IObservableArray, observable } from "mobx";
import type { MenuRegistration } from "../main/menu/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
import windowManagerInjectable from "../main/windows/manager.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "./as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

const windowManager = asLegacyGlobalObjectForExtensionApi(windowManagerInjectable);

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];
  trayMenus: TrayMenuRegistration[] = [];
  sources = observable.map<string, IComputedValue<CatalogEntity[]>>();

  navigate(pageId?: string, params?: Record<string, any>, frameId?: number) {
    return windowManager.navigateExtension(this.id, pageId, params, frameId);
  }

  /**
   * @deprecated Just call `set()` on `.sources` directly
   */
  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    this.sources.set(id, computed(() => [...source]));
  }

  /**
   * @deprecated Just call `delete()` on `.sources` directly
   */
  removeCatalogSource(id: string) {
    this.sources.delete(id);
  }
}
