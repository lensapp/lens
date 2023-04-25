/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensExtensionDependencies } from "./lens-extension";
import { LensExtension } from "./lens-extension";
import type { CatalogEntity } from "../common/catalog";
import type { IComputedValue, IObservableArray } from "mobx";
import { isObservableArray } from "mobx";
import type { MenuRegistration } from "../features/application-menu/main/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
import type { ShellEnvModifier } from "../main/shell-session/shell-env-modifier/shell-env-modifier-registration";
import { getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import type { InstalledExtension } from "./common-api";
import type { CatalogEntityRegistry } from "../main/catalog";
import type { NavigateForExtension } from "../main/start-main-application/lens-window/navigate-for-extension.injectable";
import catalogEntityRegistryInjectable from "../main/catalog/entity-registry.injectable";
import loggerInjectable from "../common/logger.injectable";
import navigateForExtensionInjectable from "../main/start-main-application/lens-window/navigate-for-extension.injectable";
import ensureHashedDirectoryForExtensionInjectable from "./extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";

interface LensMainExtensionDependencies extends LensExtensionDependencies {
  readonly entityRegistry: CatalogEntityRegistry;
  readonly navigate: NavigateForExtension;
}

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] | IComputedValue<MenuRegistration[]> = [];
  trayMenus: TrayMenuRegistration[] | IComputedValue<TrayMenuRegistration[]> = [];

  /**
   * @ignore
   */
  declare readonly dependencies: LensMainExtensionDependencies;

  constructor(extension: InstalledExtension) {
    const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi("main");
    const deps: LensMainExtensionDependencies = {
      ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
      navigate: di.inject(navigateForExtensionInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
      logger: di.inject(loggerInjectable),
    };

    super(deps, extension);
  }

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
    await this.dependencies.navigate(this.id, pageId, params, frameId);
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity> | IComputedValue<CatalogEntity[]>) {
    if (isObservableArray(source)) {
      this.dependencies.entityRegistry.addObservableSource(`${this.name}:${id}`, source);
    } else {
      this.dependencies.entityRegistry.addComputedSource(`${this.name}:${id}`, source);
    }
  }

  removeCatalogSource(id: string) {
    this.dependencies.entityRegistry.removeSource(`${this.name}:${id}`);
  }
}
