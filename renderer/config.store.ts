import { observable, when } from "mobx";
import type { IConfigRoutePayload } from "../main/routes/config";
import { autobind, interval } from "./utils";
import { apiBase } from "./api";
import { apiPrefix, buildVersion, isDevelopment } from "../common/vars";

@autobind()
export class ConfigStore {
  readonly isDevelopment = isDevelopment;
  readonly buildVersion = buildVersion;
  readonly apiPrefix = apiPrefix;

  protected updater = interval(60, this.load);

  @observable config: Partial<IConfigRoutePayload> = {};
  @observable isLoaded = false;

  async init() {
    await this.load();
    this.updater.start();
  }

  load() {
    return apiBase.get("/config").then((config: any) => {
      this.config = config;
      this.isLoaded = true;
    });
  }

  async getToken() {
    await when(() => this.isLoaded);
    return this.config.token;
  }

  get serverPort() {
    const port = location.port;
    return port ? `:${port}` : "";
  }

  get allowedNamespaces() {
    return this.config.allowedNamespaces || [];
  }

  get allowedResources() {
    return this.config.allowedResources;
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
