// Client-side config

import { observable, when } from "mobx";
import { autobind, interval } from "./utils";
import { IConfig } from "../server/common/config";
import { configApi } from "./api/endpoints/config.api";

const { IS_PRODUCTION, API_PREFIX, BUILD_VERSION } = process.env;

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

  async load(): Promise<void> {
    const config = await configApi.getConfig();
    this.config = config;
    this.isLoaded = true;
  }

  async getToken(): Promise<string> {
    await when(() => this.isLoaded);
    return this.config.token || "";
  }

  get serverPort(): string {
    const port = location.port;
    return port ? `:${port}` : "";
  }

  get allowedNamespaces(): string[] {
    return this.config.allowedNamespaces || [];
  }

  get allowedResources(): string[] {
    return this.config.allowedResources || [];
  }

  get isClusterAdmin(): boolean {
    return this.config.isClusterAdmin || false;
  }

  reset(): void {
    this.isLoaded = false;
    this.config = {};
  }
}

export const configStore = new ConfigStore();
