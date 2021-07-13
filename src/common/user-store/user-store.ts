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

import { app, remote } from "electron";
import semver from "semver";
import { action, computed, observable, reaction, makeObservable } from "mobx";
import { BaseStore } from "../base-store";
import migrations from "../../migrations/user-store";
import { getAppVersion } from "../utils/app-version";
import { kubeConfigDefaultPath } from "../kube-helpers";
import { appEventBus } from "../event-bus";
import path from "path";
import { fileNameMigration } from "../../migrations/user-store";
import { getOrInsertWith, toggle, toJS } from "../../renderer/utils";
import { DESCRIPTORS, KubeconfigSyncValue, UserPreferencesModel } from "./preferences-helpers";
import logger from "../../main/logger";

export interface UserStoreModel {
  lastSeenAppVersion: string;
  preferences: UserPreferencesModel;
}

export class UserStore extends BaseStore<UserStoreModel> /* implements UserStoreFlatModel (when strict null is enabled) */ {
  constructor() {
    super({
      configName: "lens-user-store",
      migrations,
    });

    makeObservable(this);
    fileNameMigration();
    this.load();
  }

  @observable lastSeenAppVersion = "0.0.0";

  /**
   * used in add-cluster page for providing context
   */
  @observable kubeConfigPath = kubeConfigDefaultPath;
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();
  @observable allowTelemetry: boolean;
  @observable allowErrorReporting: boolean;
  @observable allowUntrustedCAs: boolean;
  @observable colorTheme: string;
  @observable localeTimezone: string;
  @observable downloadMirror: string;
  @observable httpsProxy?: string;
  @observable shell?: string;
  @observable downloadBinariesPath?: string;
  @observable kubectlBinariesPath?: string;

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
   * The set of file/folder paths to be synced
   */
  syncKubeconfigEntries = observable.map<string, KubeconfigSyncValue>();

  @computed get isNewVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
  }

  @computed get resolvedShell(): string | undefined {
    return this.shell || process.env.SHELL || process.env.PTYSHELL;
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
        args: ["--hidden"]
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

  @action
  /**
   * Toggles the hidden configuration of a table's column
   */
  toggleTableColumnVisibility(tableId: string, columnId: string) {
    toggle(
      getOrInsertWith(this.hiddenTableColumns, tableId, observable.set),
      columnId,
    );
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

    this.httpsProxy = DESCRIPTORS.httpsProxy.fromStore(preferences?.httpsProxy);
    this.shell = DESCRIPTORS.shell.fromStore(preferences?.shell);
    this.colorTheme = DESCRIPTORS.colorTheme.fromStore(preferences?.colorTheme);
    this.localeTimezone = DESCRIPTORS.localeTimezone.fromStore(preferences?.localeTimezone);
    this.allowUntrustedCAs = DESCRIPTORS.allowUntrustedCAs.fromStore(preferences?.allowUntrustedCAs);
    this.allowTelemetry = DESCRIPTORS.allowTelemetry.fromStore(preferences?.allowTelemetry);
    this.allowErrorReporting = DESCRIPTORS.allowErrorReporting.fromStore(preferences?.allowErrorReporting);
    this.downloadMirror = DESCRIPTORS.downloadMirror.fromStore(preferences?.downloadMirror);
    this.downloadKubectlBinaries = DESCRIPTORS.downloadKubectlBinaries.fromStore(preferences?.downloadKubectlBinaries);
    this.downloadBinariesPath = DESCRIPTORS.downloadBinariesPath.fromStore(preferences?.downloadBinariesPath);
    this.kubectlBinariesPath = DESCRIPTORS.kubectlBinariesPath.fromStore(preferences?.kubectlBinariesPath);
    this.openAtLogin = DESCRIPTORS.openAtLogin.fromStore(preferences?.openAtLogin);
    this.hiddenTableColumns.replace(DESCRIPTORS.hiddenTableColumns.fromStore(preferences?.hiddenTableColumns));
    this.syncKubeconfigEntries.replace(DESCRIPTORS.syncKubeconfigEntries.fromStore(preferences?.syncKubeconfigEntries));
  }

  toJSON(): UserStoreModel {
    const model: UserStoreModel = {
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences: {
        httpsProxy: DESCRIPTORS.httpsProxy.toStore(this.httpsProxy),
        shell: DESCRIPTORS.shell.toStore(this.shell),
        colorTheme: DESCRIPTORS.colorTheme.toStore(this.colorTheme),
        localeTimezone: DESCRIPTORS.localeTimezone.toStore(this.localeTimezone),
        allowUntrustedCAs: DESCRIPTORS.allowUntrustedCAs.toStore(this.allowUntrustedCAs),
        allowTelemetry: DESCRIPTORS.allowTelemetry.toStore(this.allowTelemetry),
        allowErrorReporting: DESCRIPTORS.allowErrorReporting.toStore(this.allowErrorReporting),
        downloadMirror: DESCRIPTORS.downloadMirror.toStore(this.downloadMirror),
        downloadKubectlBinaries: DESCRIPTORS.downloadKubectlBinaries.toStore(this.downloadKubectlBinaries),
        downloadBinariesPath: DESCRIPTORS.downloadBinariesPath.toStore(this.downloadBinariesPath),
        kubectlBinariesPath: DESCRIPTORS.kubectlBinariesPath.toStore(this.kubectlBinariesPath),
        openAtLogin: DESCRIPTORS.openAtLogin.toStore(this.openAtLogin),
        hiddenTableColumns: DESCRIPTORS.hiddenTableColumns.toStore(this.hiddenTableColumns),
        syncKubeconfigEntries: DESCRIPTORS.syncKubeconfigEntries.toStore(this.syncKubeconfigEntries),
      },
    };

    return toJS(model);
  }
}

/**
 * Getting default directory to download kubectl binaries
 * @returns string
 */
export function getDefaultKubectlPath(): string {
  return path.join((app || remote.app).getPath("userData"), "binaries");
}
