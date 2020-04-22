// Client-side config

import { observable, when } from "mobx";
import { autobind, interval } from "./utils";
import { IConfig } from "../server/common/config";
import { IClientVars } from "../server/config";
import { configApi } from "./api/endpoints/config.api";

const { IS_PRODUCTION, API_PREFIX, LOCAL_SERVER_PORT, BUILD_VERSION } = process.env as any as IClientVars;

@autobind()
export class ConfigStore {
  readonly isDevelopment = !IS_PRODUCTION;
  readonly apiPrefix = API_PREFIX;
  readonly buildVersion = BUILD_VERSION;

  // auto-update config
  protected updater = interval(60, this.load);

  @observable config: Partial<IConfig> = {};
  @observable isLoaded = false;

  constructor() {
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
