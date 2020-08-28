import type { ThemeId } from "../renderer/theme.store";
import semver from "semver"
import { readFile } from "fs-extra"
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store"
import { getAppVersion } from "./utils/app-version";
import { kubeConfigDefaultPath, loadConfig } from "./kube-helpers";
import { tracker } from "./tracker";
import logger from "../main/logger";

export interface UserStoreModel {
  kubeConfigPath: string;
  lastSeenAppVersion: string;
  seenContexts: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  httpsProxy?: string;
  colorTheme?: string;
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
  downloadMirror?: string | "default";
}

export class UserStore extends BaseStore<UserStoreModel> {
  static readonly defaultTheme: ThemeId = "kontena-dark"

  private constructor() {
    super({
      // configName: "lens-user-store", // todo: migrate from default "config.json"
      migrations: migrations,
    });

    // track telemetry availability
    reaction(() => this.preferences.allowTelemetry, allowed => {
      tracker.event("telemetry", allowed ? "enabled" : "disabled");
    });

    // refresh new contexts
    this.whenLoaded.then(this.refreshNewContexts);
    reaction(() => this.kubeConfigPath, this.refreshNewContexts);
  }

  @observable lastSeenAppVersion = "0.0.0"
  @observable kubeConfigPath = kubeConfigDefaultPath; // used in add-cluster page for providing context
  @observable seenContexts = observable.set<string>();
  @observable newContexts = observable.set<string>();

  @observable preferences: UserPreferences = {
    allowTelemetry: true,
    allowUntrustedCAs: false,
    colorTheme: UserStore.defaultTheme,
    downloadMirror: "default",
  };

  get isNewVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
  }

  @action
  resetKubeConfigPath() {
    this.kubeConfigPath = kubeConfigDefaultPath;
  }

  @action
  resetTheme() {
    this.preferences.colorTheme = UserStore.defaultTheme;
  }

  @action
  saveLastSeenAppVersion() {
    tracker.event("app", "whats-new-seen")
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
  }

  @action
  markNewContextsAsSeen() {
    const { seenContexts, newContexts } = this;
    this.seenContexts.replace([...seenContexts, ...newContexts]);
    this.newContexts.clear();
  }

  @action
  protected async fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, seenContexts = [], preferences, kubeConfigPath } = data
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
    }
    return toJS(model, {
      recurseEverything: true,
    })
  }
}

export const userStore = UserStore.getInstance<UserStore>();
