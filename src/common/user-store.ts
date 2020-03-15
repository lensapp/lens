import * as ElectronStore from "electron-store"
import * as appUtil from "./app-utils"
import * as version210Beta4 from "./migrations/user-store/2.1.0-beta.4"

export interface User {
  id?: string;
  bio?: string;
  company?: string;
  email?: string;
  'first-name'?: string;
  'is-customer'?: boolean;
  'is-partner'?: boolean;
  'last-name'?: string;
  'lens-invitation-used'?: boolean;
  location?: string;
  //notifications?: array;
  url?: string;
  'user-avatar-src'?: string;
  username: string;
  verified?: boolean;
}

export interface UserPreferences {
  httpsProxy?: string;
  colorTheme?: string;
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
}

export class UserStore {
  private static instance: UserStore;
  public store: ElectronStore;

  private constructor() {
    this.store = new ElectronStore({
      projectVersion: appUtil.getAppVersion(),
      migrations: {
        "2.1.0-beta.4": version210Beta4.migration,
      }
    });
  }

  public lastSeenAppVersion() {
    return this.store.get('lastSeenAppVersion', "0.0.0")
  }

  public setLastSeenAppVersion(version: string) {
    this.store.set('lastSeenAppVersion', version)
  }

  public getSeenContexts(): Array<string> {
    return this.store.get("seenContexts", [])
  }

  public storeSeenContext(newContexts: string[]) {
    const seenContexts = this.getSeenContexts().concat(newContexts)
    // store unique contexts by casting array to set first
    const newContextSet = new Set(seenContexts)
    const allContexts = [...newContextSet]
    this.store.set("seenContexts", allContexts)
    return allContexts
  }

  public setPreferences(preferences: UserPreferences) {
    this.store.set('preferences', preferences)
  }

  public getPreferences(): UserPreferences {
    const prefs = this.store.get("preferences", {})
    if (!prefs.colorTheme) {
      prefs.colorTheme = "dark"
    }
    if (prefs.allowTelemetry === undefined) {
      prefs.allowTelemetry = true
    }

    return prefs
  }

  static getInstance(): UserStore {
    if(!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  static resetInstance() {
    UserStore.instance = null
  }
}

const userStore: UserStore = UserStore.getInstance();

export { userStore };
