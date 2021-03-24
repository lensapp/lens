import type { ThemeId } from "../renderer/theme.store";
import { app, remote } from "electron";
import semver from "semver";
import { readFile } from "fs-extra";
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store";
import { getAppVersion } from "./utils/app-version";
import { kubeConfigDefaultPath, loadConfig } from "./kube-helpers";
import { appEventBus } from "./event-bus";
import logger from "../main/logger";
import path from "path";
import { fileNameMigration } from "../migrations/user-store";

export interface UserStoreModel {
  kubeConfigPath: string;
  lastSeenAppVersion: string;
  seenContexts: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  httpsProxy?: string;
  shell?: string;
  colorTheme?: string;
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
  downloadMirror?: string | "default";
  downloadKubectlBinaries?: boolean;
  downloadBinariesPath?: string;
  kubectlBinariesPath?: string;
  openAtLogin?: boolean;
  hiddenTableColumns?: Record<string, string[]>;
}

export class UserStore extends BaseStore<UserStoreModel> {
  static readonly defaultTheme: ThemeId = "lens-dark";

  private constructor() {
    super({
      configName: "lens-user-store",
      migrations,
    });

    this.handleOnLoad();
  }

  @observable lastSeenAppVersion = "0.0.0";
  @observable kubeConfigPath = kubeConfigDefaultPath; // used in add-cluster page for providing context
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();

  @observable preferences: UserPreferences = {
    allowTelemetry: true,
    allowUntrustedCAs: false,
    colorTheme: UserStore.defaultTheme,
    downloadMirror: "default",
    downloadKubectlBinaries: true,  // Download kubectl binaries matching cluster version
    openAtLogin: false,
    hiddenTableColumns: {},
  };

  protected async handleOnLoad() {
    await this.whenLoaded;

    // refresh new contexts
    this.refreshNewContexts();
    reaction(() => this.kubeConfigPath, this.refreshNewContexts);

    if (app) {
      // track telemetry availability
      reaction(() => this.preferences.allowTelemetry, allowed => {
        appEventBus.emit({ name: "telemetry", action: allowed ? "enabled" : "disabled" });
      });

      // open at system start-up
      reaction(() => this.preferences.openAtLogin, openAtLogin => {
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

  get isNewVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
  }

  @action
  setHiddenTableColumns(tableId: string, names: Set<string> | string[]) {
    this.preferences.hiddenTableColumns[tableId] = Array.from(names);
  }

  getHiddenTableColumns(tableId: string): Set<string> {
    return new Set(this.preferences.hiddenTableColumns[tableId]);
  }

  @action
  resetKubeConfigPath() {
    this.kubeConfigPath = kubeConfigDefaultPath;
  }

  @action
  async resetTheme() {
    await this.whenLoaded;
    this.preferences.colorTheme = UserStore.defaultTheme;
  }

  @action
  saveLastSeenAppVersion() {
    appEventBus.emit({ name: "app", action: "whats-new-seen" });
    this.lastSeenAppVersion = getAppVersion();
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

  /**
   * Getting default directory to download kubectl binaries
   * @returns string
   */
  getDefaultKubectlPath(): string {
    return path.join((app || remote.app).getPath("userData"), "binaries");
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
    Object.assign(this.preferences, preferences);
  }

  toJSON(): UserStoreModel {
    const model: UserStoreModel = {
      kubeConfigPath: this.kubeConfigPath,
      lastSeenAppVersion: this.lastSeenAppVersion,
      seenContexts: Array.from(this.seenContexts),
      preferences: this.preferences,
    };

    return toJS(model, {
      recurseEverything: true,
    });
  }
}

export const userStore = UserStore.getInstance<UserStore>();
