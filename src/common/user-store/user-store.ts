/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app, ipcMain } from "electron";
import semver, { SemVer } from "semver";
import { action, computed, observable, reaction, makeObservable, isObservableArray, isObservableSet, isObservableMap } from "mobx";
import { BaseStore } from "../base-store";
import migrations, { fileNameMigration } from "../../migrations/user-store";
import { getAppVersion } from "../utils/app-version";
import { kubeConfigDefaultPath } from "../kube-helpers";
import { appEventBus } from "../app-event-bus/event-bus";
import { getOrInsertSet, toggle, toJS, object } from "../../renderer/utils";
import { DESCRIPTORS } from "./preferences-helpers";
import type { UserPreferencesModel, StoreType } from "./preferences-helpers";
import logger from "../../main/logger";

export interface UserStoreModel {
  lastSeenAppVersion: string;
  preferences: UserPreferencesModel;
}

export class UserStore extends BaseStore<UserStoreModel> /* implements UserStoreFlatModel (when strict null is enabled) */ {
  readonly displayName = "UserStore";
  constructor() {
    super({
      configName: "lens-user-store",
      migrations,
    });

    makeObservable(this);

    if (ipcMain) {
      fileNameMigration();
    }

    this.load();
  }

  @observable lastSeenAppVersion = "0.0.0";

  /**
   * used in add-cluster page for providing context
   * @deprecated No longer used
   */
  @observable kubeConfigPath = kubeConfigDefaultPath;

  /**
   * @deprecated No longer used
   */
  @observable seenContexts = observable.set<string>();

  /**
   * @deprecated No longer used
   */
  @observable newContexts = observable.set<string>();

  @observable allowTelemetry!: StoreType<typeof DESCRIPTORS["allowTelemetry"]>;
  @observable allowErrorReporting!: StoreType<typeof DESCRIPTORS["allowErrorReporting"]>;
  @observable allowUntrustedCAs!: StoreType<typeof DESCRIPTORS["allowUntrustedCAs"]>;
  @observable colorTheme!: StoreType<typeof DESCRIPTORS["colorTheme"]>;
  @observable terminalTheme!: StoreType<typeof DESCRIPTORS["terminalTheme"]>;
  @observable localeTimezone!: StoreType<typeof DESCRIPTORS["localeTimezone"]>;
  @observable downloadMirror!: StoreType<typeof DESCRIPTORS["downloadMirror"]>;
  @observable httpsProxy!: StoreType<typeof DESCRIPTORS["httpsProxy"]>;
  @observable shell!: StoreType<typeof DESCRIPTORS["shell"]>;
  @observable downloadBinariesPath!: StoreType<typeof DESCRIPTORS["downloadBinariesPath"]>;
  @observable kubectlBinariesPath!: StoreType<typeof DESCRIPTORS["kubectlBinariesPath"]>;
  @observable terminalCopyOnSelect!: StoreType<typeof DESCRIPTORS["terminalCopyOnSelect"]>;
  @observable terminalConfig!: StoreType<typeof DESCRIPTORS["terminalConfig"]>;
  @observable updateChannel!: StoreType<typeof DESCRIPTORS["updateChannel"]>;
  @observable extensionRegistryUrl!: StoreType<typeof DESCRIPTORS["extensionRegistryUrl"]>;

  /**
   * Download kubectl binaries matching cluster version
   */
  @observable downloadKubectlBinaries!: StoreType<typeof DESCRIPTORS["downloadKubectlBinaries"]>;

  /**
   * Whether the application should open itself at login.
   */
  @observable openAtLogin!: StoreType<typeof DESCRIPTORS["openAtLogin"]>;

  /**
   * The column IDs under each configurable table ID that have been configured
   * to not be shown
   */
  @observable hiddenTableColumns!: StoreType<typeof DESCRIPTORS["hiddenTableColumns"]>;

  /**
   * Monaco editor configs
   */
  @observable editorConfiguration!: StoreType<typeof DESCRIPTORS["editorConfiguration"]>;

  /**
   * The set of file/folder paths to be synced
   */
  @observable syncKubeconfigEntries!: StoreType<typeof DESCRIPTORS["syncKubeconfigEntries"]>;

  @computed get isNewVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
  }

  @computed get resolvedShell(): string | undefined {
    return this.shell || process.env.SHELL || process.env.PTYSHELL;
  }

  @computed get isAllowedToDowngrade() {
    return new SemVer(getAppVersion()).prerelease[0] !== this.updateChannel;
  }

  startMainReactions() {
    // track telemetry availability
    reaction(() => this.allowTelemetry, allowed => {
      appEventBus.emit({ name: "telemetry", action: allowed ? "enabled" : "disabled" });
    });

    // open at system start-up
    reaction(() => this.openAtLogin, openAtLogin => {
      app.setLoginItemSettings({
        openAtLogin,
        openAsHidden: true,
        args: ["--hidden"],
      });
    }, {
      fireImmediately: true,
    });
  }

  /**
   * Checks if a column (by ID) for a table (by ID) is configured to be hidden
   * @param tableId The ID of the table to be checked against
   * @param columnIds The list of IDs the check if one is hidden
   * @returns true if at least one column under the table is set to hidden
   */
  isTableColumnHidden(tableId: string, ...columnIds: (string | undefined)[]): boolean {
    if (columnIds.length === 0) {
      return false;
    }

    const config = this.hiddenTableColumns.get(tableId);

    if (!config) {
      return false;
    }

    return columnIds.some(columnId => columnId && config.has(columnId));
  }

  /**
   * Toggles the hidden configuration of a table's column
   */
  toggleTableColumnVisibility(tableId: string, columnId: string) {
    toggle(getOrInsertSet(this.hiddenTableColumns, tableId), columnId);
  }

  @action
  resetTheme() {
    this.colorTheme = DESCRIPTORS.colorTheme.fromStore(undefined);
  }

  @action
  saveLastSeenAppVersion() {
    appEventBus.emit({ name: "app", action: "whats-new-seen" });
    this.lastSeenAppVersion = getAppVersion();
  }

  @action
  protected fromStore({ lastSeenAppVersion, preferences }: Partial<UserStoreModel> = {}) {
    logger.debug("UserStore.fromStore()", { lastSeenAppVersion, preferences });

    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    for (const [key, { fromStore }] of object.entries(DESCRIPTORS)) {
      const curVal = this[key];
      const newVal = fromStore((preferences)?.[key] as never) as never;

      if (isObservableArray(curVal)) {
        curVal.replace(newVal);
      } else if (isObservableSet(curVal) || isObservableMap(curVal)) {
        curVal.replace(newVal);
      } else {
        this[key] = newVal;
      }
    }
  }

  toJSON(): UserStoreModel {
    const preferences = object.fromEntries(
      object.entries(DESCRIPTORS)
        .map(([key, { toStore }]) => [key, toStore(this[key] as never)]),
    ) as UserPreferencesModel;

    return toJS({
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences,
    });
  }
}
