import type { IConfigRoutePayload } from "../main/routes/config";

import { observable, when } from "mobx";
import { autobind, interval } from "./utils";
import { configApi } from "./api/endpoints/config.api";

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
    return configApi.getConfig().then((config: any) => {
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
