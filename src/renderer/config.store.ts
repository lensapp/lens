import type { IConfigRoutePayload } from "../main/routes/config-route";
import { observable, when } from "mobx";
import { autobind, interval } from "./utils";
import { apiBase } from "./api";

// todo: use user-store.ts as isomorphic-store with config/settings for ui

@autobind()
export class ConfigStore {
  protected updater = interval(60, this.load);

  @observable config: Partial<IConfigRoutePayload> = {};
  @observable isLoaded = false;

  async init() {
    await this.load();
    this.updater.start();
  }

  load() {
    if (location.hostname === "no-clusters.localhost") {
      return;
    }
    return apiBase.get("/config").then((config: IConfigRoutePayload) => {
      this.config = config;
      this.isLoaded = true;
    });
  }

  async getToken() {
    await when(() => this.isLoaded);
    return this.config.token;
  }

  get allowedNamespaces() {
    return this.config.allowedNamespaces || [];
  }

  get allowedResources() {
    return this.config.allowedResources || [];
  }

  get isClusterAdmin() {
    return this.config.isClusterAdmin;
  }

  reset() {
    this.isLoaded = false;
    this.config = {};
  }
}

export const configStore = new ConfigStore();
