import semver from "semver"
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store"
import { getAppVersion } from "./utils/app-version";
import { tracker } from "./tracker";

export interface UserStoreModel {
  lastSeenAppVersion: string;
  seenContexts: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  httpsProxy?: string;
  colorTheme?: string | "dark";
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
  downloadMirror?: string | "default";
}

export class UserStore extends BaseStore<UserStoreModel> {
  private constructor() {
    super({
      configName: "lens-user-store",
      migrations: migrations,
    });

    // track telemetry availability
    reaction(() => this.preferences.allowTelemetry, allowed => {
      tracker.event("telemetry", allowed ? "enabled" : "disabled");
    });
  }

  @observable lastSeenAppVersion = "0.0.0"
  @observable seenContexts: string[] = [];
  @observable newContexts: string[] = []; // todo: detect new contexts from .kube/config since last open

  @observable preferences: UserPreferences = {
    allowTelemetry: true,
    colorTheme: "dark",
    downloadMirror: "default",
  };

  get hasNewAppVersion() {
    return semver.gt(getAppVersion(), this.lastSeenAppVersion);
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

export const userStore: UserStore = UserStore.getInstance();
