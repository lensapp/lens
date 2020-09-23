import type { ThemeId } from "../renderer/theme.store";
import { app, remote } from 'electron';
import semver from "semver"
import { readFile } from "fs-extra"
import { action, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/user-store"
import { getAppVersion } from "./utils/app-version";
import { kubeConfigDefaultPath, loadConfig } from "./kube-helpers";
import { tracker } from "./tracker";
import logger from "../main/logger";
import path from 'path';
import jwt_decode from "jwt-decode";
import { List } from "material-ui";

export interface UserStoreModel {
  kubeConfigPath: string;
  lastSeenAppVersion: string;
  seenContexts: string[];
  preferences: UserPreferences;
  token: Token;
  lastLoggedInUser: string;
}

export interface UserPreferences {
  httpsProxy?: string;
  colorTheme?: string;
  allowUntrustedCAs?: boolean;
  allowTelemetry?: boolean;
  downloadMirror?: string | "default";
  downloadKubectlBinaries?: boolean;
  downloadBinariesPath?: string;
  kubectlBinariesPath?: string;
}

export interface Token {
  preferredUserName?: string,
  token?: string;
  tokenValidTill?: number;
  refreshToken?: string;
  refreshTokenValidTill?: number;
}

interface IDToken {
  jti: string,
  exp: number,
  nbf: number,
  iat: number,
  iss: string,
  aud: string,
  sub: string,
  typ: string,
  azp: string,
  auth_time: number,
  session_state: string,
  acr: string,
  iam_roles: string[],
  email_verified: boolean,
  preferred_username: string
}

interface RefreshToken {
  jti: string,
  exp: number,
  nbf: number,
  iat: number,
  iss: string,
  aud: string,
  sub: string,
  typ: string,
  azp: string,
  auth_time: number,
  session_state: string,
  realm_access: Array<string[]>,
  scope: string
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
    downloadKubectlBinaries: true,  // Download kubectl binaries matching cluster version
    downloadBinariesPath: this.getDefaultKubectlPath(),
    kubectlBinariesPath: ""
  };

  @observable token: Token = {
    token: "",
    refreshToken: ""
  }

  @observable lastLoggedInUser = "";

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

  /**
   * Getting default directory to download kubectl binaries
   * @returns string
   */
  getDefaultKubectlPath(): string {
    return path.join((app || remote.app).getPath("userData"), "binaries")
  }

  getTokenDetails(): Token {
    return this.token;
  }

  decodeToken(token: string) {
    if (token.length > 0) {
      return jwt_decode<IDToken>(token);
    }
  }

  decodeRefreshToken(refreshToken: string) {
    if (refreshToken.length > 0) {
      return jwt_decode<RefreshToken>(refreshToken);
    }
  }

  getIDTokenIAMPermissions(): string[] {
    let tokenDecoded = this.decodeToken(this.token.token);
    const userRoles = tokenDecoded.iam_roles || [];
    return userRoles
  }

  isTokenExpired(validTill: number): boolean {
    // Create a current UnixTime style date in ms
    const timeNow = Math.round(Date.now());
    console.log(`isTokenExpired: timeNow: ${new Date(timeNow).toString()}`);
    console.log(`isTokenExpired: validTill: ${new Date(validTill).toString()}`);
    //if ((new Date(validTill).getMinutes() - new Date().getMinutes()) / 1000 / 60 < 0) {
    if (timeNow > validTill) {
      return true;
    }
    return false;
  }

  @action
  setTokenDetails(token: string, refreshToken: string) {
    
    let tokenDecoded = this.decodeToken(token);
    let refreshTokenDecoded = this.decodeToken(refreshToken);
    
    this.token.token = token;
    this.token.refreshToken = refreshToken;
    this.token.preferredUserName = tokenDecoded.preferred_username;

    // Create a current UnixTime style date in secs
    this.token.tokenValidTill = tokenDecoded.exp * 1000; 
    this.token.refreshTokenValidTill = refreshTokenDecoded.exp * 1000;

    console.info('The saved token object is: ' + JSON.stringify(this.token));
    const tokenSavedAt = new Date();
    console.log(`keycloak token retrieved at: ${tokenSavedAt.toLocaleTimeString()}`);

    console.info('Check if token date is expired: ' + this.isTokenExpired(this.token.tokenValidTill));
  }

  @action
  saveLastLoggedInUser(user: string) {
    this.lastLoggedInUser = user;
  }

  @action
  protected async fromStore(data: Partial<UserStoreModel> = {}) {
    const { lastSeenAppVersion, seenContexts = [], preferences, kubeConfigPath, token } = data
    if (lastSeenAppVersion) {
      this.lastSeenAppVersion = lastSeenAppVersion;
    }
    if (kubeConfigPath) {
      this.kubeConfigPath = kubeConfigPath;
    }
    this.seenContexts.replace(seenContexts);
    Object.assign(this.preferences, preferences);
    Object.assign(this.token, token);
  }

  toJSON(): UserStoreModel {
    const model: UserStoreModel = {
      kubeConfigPath: this.kubeConfigPath,
      lastSeenAppVersion: this.lastSeenAppVersion,
      seenContexts: Array.from(this.seenContexts),
      preferences: this.preferences,
      token: this.token,
      lastLoggedInUser: this.lastLoggedInUser,
    }
    return toJS(model, {
      recurseEverything: true,
    })
  }
}

export const userStore = UserStore.getInstance<UserStore>();
