import type { ThemeId } from "../renderer/theme.store";
import semver from "semver"
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store"
import { getAppVersion } from "./utils/app-version";
import { tracker } from "./tracker";

// fixme: detect new contexts from .kube/config since last open

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
      // configName: "lens-user-store", // todo: migrate from default filename
      migrations: migrations,
    });

    // track telemetry availability
    reaction(() => this.preferences.allowTelemetry, allowed => {
      tracker.event("telemetry", allowed ? "enabled" : "disabled");
    });
  }

  @observable lastSeenAppVersion = "0.0.0"
  @observable seenContexts: string[] = [];
  @observable newContexts: string[] = [];

  @observable preferences: UserPreferences = {
    allowTelemetry: true,
    allowUntrustedCAs: false,
    colorTheme: UserStore.defaultTheme,
    downloadMirror: "default",
    httpsProxy: "",
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

  @action
  protected fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, seenContexts = [], preferences } = data
    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }
    this.seenContexts = seenContexts;
    Object.assign(this.preferences, preferences);
  }

  toJSON() {
    return toJS({
      lastSeenAppVersion: this.lastSeenAppVersion,
      seenContexts: Array.from(this.seenContexts),
      preferences: this.preferences,
    }, {
      recurseEverything: true,
    })
  }
}

export const userStore = UserStore.getInstance<UserStore>();
