/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app } from "electron";
import semver, { SemVer } from "semver";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { BaseStore } from "../base-store";
import { getAppVersion } from "../utils/app-version";
import { kubeConfigDefaultPath } from "../kube-helpers";
import { appEventBus } from "../app-event-bus/event-bus";
import { ObservableToggleSet, toJS } from "../../renderer/utils";
import { DESCRIPTORS, EditorConfiguration, ExtensionRegistry, KubeconfigSyncValue, UserPreferencesModel, TerminalConfig } from "./preferences-helpers";
import logger from "../../main/logger";
import type { Migrations } from "conf/dist/source/types";

export interface UserPreferencesStoreModel {
  lastSeenAppVersion: string;
  preferences: UserPreferencesModel;
}

interface UserStoreDependencies {
  migrations: Migrations<UserPreferencesStoreModel> | undefined;
  fileNameMigration: () => void;
}

export class UserPreferencesStore extends BaseStore<UserPreferencesStoreModel> /* implements UserStoreFlatModel (when strict null is enabled) */ {
  readonly displayName = "UserStore";
  constructor({ migrations, fileNameMigration }: UserStoreDependencies) {
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
  hiddenTableColumns = observable.map<string, ObservableToggleSet<string>>();

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

  readonly resolvedShell = computed(() => this.shell || process.env.SHELL || process.env.PTYSHELL);

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
  isTableColumnHidden = (tableId: string, ...columnIds: string[]): boolean => {
    if (columnIds.length === 0) {
      return false;
    }

    const config = this.hiddenTableColumns.get(tableId);

    if (!config) {
      return false;
    }

    return columnIds.some(columnId => config.has(columnId));
  };

  @action
  /**
   * Toggles the hidden configuration of a table's column
   */
  toggleTableColumnVisibility = (tableId: string, columnId: string) => {
    if (!this.hiddenTableColumns.get(tableId)) {
      this.hiddenTableColumns.set(tableId, new ObservableToggleSet());
    }

    this.hiddenTableColumns.get(tableId).toggle(columnId);
  };

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
  protected fromStore({ lastSeenAppVersion, preferences }: Partial<UserPreferencesStoreModel> = {}) {
    logger.debug("UserStore.fromStore()", { lastSeenAppVersion, preferences });

    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    this.httpsProxy = DESCRIPTORS.httpsProxy.fromStore(preferences?.httpsProxy);
    this.shell = DESCRIPTORS.shell.fromStore(preferences?.shell);
    this.colorTheme = DESCRIPTORS.colorTheme.fromStore(preferences?.colorTheme);
    this.terminalTheme = DESCRIPTORS.terminalTheme.fromStore(preferences?.terminalTheme);
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
    this.editorConfiguration = DESCRIPTORS.editorConfiguration.fromStore(preferences?.editorConfiguration);
    this.terminalCopyOnSelect = DESCRIPTORS.terminalCopyOnSelect.fromStore(preferences?.terminalCopyOnSelect);
    this.terminalConfig = DESCRIPTORS.terminalConfig.fromStore(preferences?.terminalConfig);
    this.updateChannel = DESCRIPTORS.updateChannel.fromStore(preferences?.updateChannel);
    this.extensionRegistryUrl = DESCRIPTORS.extensionRegistryUrl.fromStore(preferences?.extensionRegistryUrl);
  }

  toJSON(): UserPreferencesStoreModel {
    const model: UserPreferencesStoreModel = {
      lastSeenAppVersion: this.lastSeenAppVersion,
      preferences: {
        httpsProxy: DESCRIPTORS.httpsProxy.toStore(this.httpsProxy),
        shell: DESCRIPTORS.shell.toStore(this.shell),
        colorTheme: DESCRIPTORS.colorTheme.toStore(this.colorTheme),
        terminalTheme: DESCRIPTORS.terminalTheme.toStore(this.terminalTheme),
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
        editorConfiguration: DESCRIPTORS.editorConfiguration.toStore(this.editorConfiguration),
        terminalCopyOnSelect: DESCRIPTORS.terminalCopyOnSelect.toStore(this.terminalCopyOnSelect),
        terminalConfig: DESCRIPTORS.terminalConfig.toStore(this.terminalConfig),
        updateChannel: DESCRIPTORS.updateChannel.toStore(this.updateChannel),
        extensionRegistryUrl: DESCRIPTORS.extensionRegistryUrl.toStore(this.extensionRegistryUrl),
      },
    };

    return toJS(model);
  }
}
