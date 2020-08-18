import type { ThemeId } from "../renderer/theme.store";
import semver from "semver"
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store"
import { getAppVersion } from "./utils/app-version";
import { getKubeConfigLocal, loadConfig } from "./kube-helpers";
import { tracker } from "./tracker";

export interface UserStoreModel {
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
    reaction(() => this.seenContexts.size, this.refreshNewContexts);
  }

  @observable lastSeenAppVersion = "0.0.0"
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
  resetTheme() {
    this.preferences.colorTheme = UserStore.defaultTheme;
  }

  @action
  saveLastSeenAppVersion() {
    tracker.event("app", "whats-new-seen")
    this.lastSeenAppVersion = getAppVersion();
  }

  protected refreshNewContexts = async () => {
    const kubeConfig = await getKubeConfigLocal();
    if (kubeConfig) {
      this.newContexts.clear();
      const localContexts = loadConfig(kubeConfig).getContexts();
      localContexts
        .filter(ctx => ctx.cluster)
        .filter(ctx => !this.seenContexts.has(ctx.name))
        .forEach(ctx => this.newContexts.add(ctx.name));
    }
  }

  @action
  markNewContextsAsSeen() {
    const { seenContexts, newContexts } = this;
    this.seenContexts.replace([...seenContexts, ...newContexts]);
    this.newContexts.clear();
  }

  @action
  protected fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, seenContexts = [], preferences } = data
    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }
    this.seenContexts.replace(seenContexts);
    Object.assign(this.preferences, preferences);
  }

  toJSON(): UserStoreModel {
    const model: UserStoreModel = {
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
