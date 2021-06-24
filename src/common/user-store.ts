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

import type { ThemeId } from "../renderer/theme.store";
import { app, remote } from "electron";
import semver from "semver";
import { action, computed, observable, reaction, makeObservable } from "mobx";
import moment from "moment-timezone";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store";
import { getAppVersion } from "./utils/app-version";
import { appEventBus } from "./event-bus";
import path from "path";
import os from "os";
import { fileNameMigration } from "../migrations/user-store";
import { ObservableToggleSet, toJS } from "../renderer/utils";

export interface UserStoreModel {
  lastSeenAppVersion: string;
  preferences: UserPreferencesModel;
}

export interface KubeconfigSyncEntry extends KubeconfigSyncValue {
  filePath: string;
}

export interface KubeconfigSyncValue { }

export interface UserPreferencesModel {
  httpsProxy?: string;
  shell?: string;
  colorTheme?: string;
  localeTimezone?: string;
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
  downloadMirror?: string | "default";
  downloadKubectlBinaries?: boolean;
  downloadBinariesPath?: string;
  kubectlBinariesPath?: string;
  openAtLogin?: boolean;
  hiddenTableColumns?: [string, string[]][];
  syncKubeconfigEntries?: KubeconfigSyncEntry[];
}

export class UserStore extends BaseStore<UserStoreModel> {
  static readonly defaultTheme: ThemeId = "lens-dark";

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
  @observable allowTelemetry = true;
  @observable allowUntrustedCAs = false;
  @observable colorTheme = UserStore.defaultTheme;
  @observable localeTimezone = moment.tz.guess(true) || "UTC";
  @observable downloadMirror = "default";
  @observable httpsProxy?: string;
  @observable shell?: string;
  @observable downloadBinariesPath?: string;
  @observable kubectlBinariesPath?: string;

  /**
   * Download kubectl binaries matching cluster version
   */
  @observable downloadKubectlBinaries = true;
  @observable openAtLogin = false;

  /**
   * The column IDs under each configurable table ID that have been configured
   * to not be shown
   */
  hiddenTableColumns = observable.map<string, ObservableToggleSet<string>>();

  /**
   * The set of file/folder paths to be synced
   */
  syncKubeconfigEntries = observable.map<string, KubeconfigSyncValue>([
    [path.join(os.homedir(), ".kube"), {}]
  ]);

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
      return true;
    }

    const config = this.hiddenTableColumns.get(tableId);

    if (!config) {
      return true;
    }

    return columnIds.some(columnId => config.has(columnId));
  }

  @action
  /**
   * Toggles the hidden configuration of a table's column
   */
  toggleTableColumnVisibility(tableId: string, columnId: string) {
    this.hiddenTableColumns.get(tableId)?.toggle(columnId);
  }

  @action
  resetTheme() {
    this.colorTheme = UserStore.defaultTheme;
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
  protected async fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, preferences } = data;

    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    if (!preferences) {
      return;
    }

    this.httpsProxy = preferences.httpsProxy;
    this.shell = preferences.shell;
    this.colorTheme = preferences.colorTheme;
    this.localeTimezone = preferences.localeTimezone;
    this.allowUntrustedCAs = preferences.allowUntrustedCAs;
    this.allowTelemetry = preferences.allowTelemetry;
    this.downloadMirror = preferences.downloadMirror;
    this.downloadKubectlBinaries = preferences.downloadKubectlBinaries;
    this.downloadBinariesPath = preferences.downloadBinariesPath;
    this.kubectlBinariesPath = preferences.kubectlBinariesPath;
    this.openAtLogin = preferences.openAtLogin;

    if (preferences.hiddenTableColumns) {
      this.hiddenTableColumns.replace(
        preferences.hiddenTableColumns
          .map(([tableId, columnIds]) => [tableId, new ObservableToggleSet(columnIds)])
      );
    }

    if (preferences.syncKubeconfigEntries) {
      this.syncKubeconfigEntries.replace(
        preferences.syncKubeconfigEntries.map(({ filePath, ...rest }) => [filePath, rest])
      );
    }
  }

  toJSON(): UserStoreModel {
    const hiddenTableColumns: [string, string[]][] = [];
    const syncKubeconfigEntries: KubeconfigSyncEntry[] = [];

    for (const [key, values] of this.hiddenTableColumns.entries()) {
      hiddenTableColumns.push([key, Array.from(values)]);
    }

    for (const [filePath, rest] of this.syncKubeconfigEntries) {
      syncKubeconfigEntries.push({ filePath, ...rest });
    }

    const model: UserStoreModel = {
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences: {
        httpsProxy: toJS(this.httpsProxy),
        shell: toJS(this.shell),
        colorTheme: toJS(this.colorTheme),
        localeTimezone: toJS(this.localeTimezone),
        allowUntrustedCAs: toJS(this.allowUntrustedCAs),
        allowTelemetry: toJS(this.allowTelemetry),
        downloadMirror: toJS(this.downloadMirror),
        downloadKubectlBinaries: toJS(this.downloadKubectlBinaries),
        downloadBinariesPath: toJS(this.downloadBinariesPath),
        kubectlBinariesPath: toJS(this.kubectlBinariesPath),
        openAtLogin: toJS(this.openAtLogin),
        hiddenTableColumns,
        syncKubeconfigEntries,
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
