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
import { getOrInsertSet, toggle, toJS, entries, fromEntries } from "../../renderer/utils";
import { DESCRIPTORS } from "./preferences-helpers";
import type { EditorConfiguration, ExtensionRegistry, KubeconfigSyncValue, UserPreferencesModel, TerminalConfig } from "./preferences-helpers";
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
   */
  @observable kubeConfigPath = kubeConfigDefaultPath;
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();
  @observable allowErrorReporting: boolean;
  @observable allowUntrustedCAs: boolean;
  @observable colorTheme: string;
  @observable terminalTheme: string;
  @observable localeTimezone: string;
  @observable downloadMirror: string;
  @observable httpsProxy?: string;
  @observable shell?: string;
  @observable downloadBinariesPath?: string;
  @observable kubectlBinariesPath?: string;
  @observable terminalCopyOnSelect: boolean;
  @observable terminalConfig: TerminalConfig;
  @observable updateChannel?: string;
  @observable extensionRegistryUrl: ExtensionRegistry;

  /**
   * Download kubectl binaries matching cluster version
   */
  @observable downloadKubectlBinaries: boolean;
  @observable openAtLogin: boolean;

  /**
   * The column IDs under each configurable table ID that have been configured
   * to not be shown
   */
  hiddenTableColumns = observable.map<string, Set<string>>();

  /**
   * Monaco editor configs
   */
  @observable editorConfiguration: EditorConfiguration;

  /**
   * The set of file/folder paths to be synced
   */
  syncKubeconfigEntries = observable.map<string, KubeconfigSyncValue>();

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
  isTableColumnHidden(tableId: string, ...columnIds: string[]): boolean {
    if (columnIds.length === 0) {
      return false;
    }

    const config = this.hiddenTableColumns.get(tableId);

    if (!config) {
      return false;
    }

    return columnIds.some(columnId => config.has(columnId));
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
  setLocaleTimezone(tz: string) {
    this.localeTimezone = tz;
  }

  @action
  protected fromStore({ lastSeenAppVersion, preferences }: Partial<UserStoreModel> = {}) {
    logger.debug("UserStore.fromStore()", { lastSeenAppVersion, preferences });

    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    for (const [key, { fromStore }] of entries(DESCRIPTORS)) {
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
    const preferences = fromEntries(
      entries(DESCRIPTORS)
        .map(([key, { toStore }]) => [key, toStore(this[key] as never)]),
    ) as UserPreferencesModel;

    return toJS({
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences,
    });
  }
}
