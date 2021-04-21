import type { ThemeId } from "../renderer/theme.store";
import { app, remote } from "electron";
import semver from "semver";
import { readFile } from "fs-extra";
import { action, computed, observable, reaction, toJS } from "mobx";
import moment from "moment-timezone";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store";
import { getAppVersion } from "./utils/app-version";
import { kubeConfigDefaultPath, loadConfig } from "./kube-helpers";
import { appEventBus } from "./event-bus";
import logger from "../main/logger";
import path from "path";
import { fileNameMigration } from "../migrations/user-store";
import { ObservableToggleSet } from "../renderer/utils";

export interface UserStoreModel {
  kubeConfigPath: string;
  lastSeenAppVersion: string;
  seenContexts: string[];
  preferences: UserPreferencesModel;
}

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
}

export class UserStore extends BaseStore<UserStoreModel> {
  static readonly defaultTheme: ThemeId = "lens-dark";

  constructor() {
    super({
      configName: "lens-user-store",
      migrations,
    });

    this.handleOnLoad();
  }

  @observable lastSeenAppVersion = "0.0.0";

  /**
   * used in add-cluster page for providing context
   */
  @observable kubeConfigPath = kubeConfigDefaultPath;
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();
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
  hiddenTableColumns = observable.map<string, ObservableToggleSet<string>>();

  protected async handleOnLoad() {
    await this.whenLoaded;

    // refresh new contexts
    this.refreshNewContexts();
    reaction(() => this.kubeConfigPath, this.refreshNewContexts);

    if (app) {
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
  }

  async load(): Promise<void> {
    /**
     * This has to be here before the call to `new Config` in `super.load()`
     * as we have to make sure that file is in the expected place for that call
     */
    await fileNameMigration();

    return super.load();
  }

  @computed get isNewVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
  }

  @computed get resolvedShell(): string | undefined {
    return this.shell || process.env.SHELL || process.env.PTYSHELL;
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
  resetKubeConfigPath() {
    this.kubeConfigPath = kubeConfigDefaultPath;
  }

  @computed get isDefaultKubeConfigPath(): boolean {
    return this.kubeConfigPath === kubeConfigDefaultPath;
  }

  @action
  async resetTheme() {
    await this.whenLoaded;
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

  protected refreshNewContexts = async () => {
    try {
      const kubeConfig = await readFile(this.kubeConfigPath, "utf8");

      if (kubeConfig) {
        this.newContexts.clear();
        loadConfig(kubeConfig).getContexts()
          .filter(ctx => ctx.cluster)
          .filter(ctx => !this.seenContexts.has(ctx.name))
          .forEach(ctx => this.newContexts.add(ctx.name));
      }
    } catch (err) {
      logger.error(err);
      this.resetKubeConfigPath();
    }
  };

  @action
  markNewContextsAsSeen() {
    const { seenContexts, newContexts } = this;

    this.seenContexts.replace([...seenContexts, ...newContexts]);
    this.newContexts.clear();
  }

  @action
  protected async fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, seenContexts = [], preferences, kubeConfigPath } = data;

    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }

    if (kubeConfigPath) {
      this.kubeConfigPath = kubeConfigPath;
    }
    this.seenContexts.replace(seenContexts);

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

    this.hiddenTableColumns.clear();

    for (const [tableId, columnIds] of preferences.hiddenTableColumns ?? []) {
      this.hiddenTableColumns.set(tableId, new ObservableToggleSet(columnIds));
    }
  }

  toJSON(): UserStoreModel {
    const hiddenTableColumns: [string, string[]][] = [];

    for (const [key, values] of this.hiddenTableColumns.entries()) {
      hiddenTableColumns.push([key, Array.from(values)]);
    }

    const model: UserStoreModel = {
      kubeConfigPath: this.kubeConfigPath,
      lastSeenAppVersion: this.lastSeenAppVersion,
      seenContexts: Array.from(this.seenContexts),
      preferences: {
        httpsProxy: this.httpsProxy,
        shell: this.shell,
        colorTheme: this.colorTheme,
        localeTimezone: this.localeTimezone,
        allowUntrustedCAs: this.allowUntrustedCAs,
        allowTelemetry: this.allowTelemetry,
        downloadMirror: this.downloadMirror,
        downloadKubectlBinaries: this.downloadKubectlBinaries,
        downloadBinariesPath: this.downloadBinariesPath,
        kubectlBinariesPath: this.kubectlBinariesPath,
        openAtLogin: this.openAtLogin,
        hiddenTableColumns,
      },
    };

    return toJS(model, {
      recurseEverything: true,
    });
  }
}

/**
 * Getting default directory to download kubectl binaries
 * @returns string
 */
export function getDefaultKubectlPath(): string {
  return path.join((app || remote.app).getPath("userData"), "binaries");
}
