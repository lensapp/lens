/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LensExtension, lensExtensionDependencies } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import type { CatalogEntity } from "../common/catalog";
import type { IObservableArray } from "mobx";
import type { MenuRegistration } from "../main/menu/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
import type { ShellEnvModifier } from "../main/shell-session/shell-env-modifier/shell-env-modifier-registration";
import type { LensMainExtensionDependencies } from "./lens-extension-set-dependencies";

export class LensMainExtension extends LensExtension<LensMainExtensionDependencies> {
  appMenus: MenuRegistration[] = [];
  trayMenus: TrayMenuRegistration[] = [];

  /**
   * implement this to modify the shell environment that Lens terminals are opened with. The ShellEnvModifier type has the signature
   *
   * (ctx: ShellEnvContext, env: Record<string, string | undefined>) => Record<string, string | undefined>
   *
   *  @param ctx the shell environment context, specifically the relevant catalog entity for the terminal. This can be used, for example, to get
   * cluster-specific information that can be made available in the shell environment by the implementation of terminalShellEnvModifier
   *
   * @param env the current shell environment that the terminal will be opened with. The implementation should modify this as desired.
   *
   * @returns the modified shell environment that the terminal will be opened with. The implementation must return env as passed in, if it
   * does not modify the shell environment
   */
  terminalShellEnvModifier?: ShellEnvModifier;

  async navigate(pageId?: string, params?: Record<string, any>, frameId?: number) {
    return WindowManager.getInstance().navigateExtension(this.id, pageId, params, frameId);
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    this[lensExtensionDependencies].entityRegistry.addObservableSource(`${this.name}:${id}`, source);
  }

  removeCatalogSource(id: string) {
    this[lensExtensionDependencies].entityRegistry.removeSource(`${this.name}:${id}`);
  }
}
