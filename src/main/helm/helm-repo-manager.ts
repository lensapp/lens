import yaml from "js-yaml";
import { readFile } from "fs-extra";
import { promiseExec, stdOptimizedPromiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";
import { defaultGotOptions } from "../../common/got-opts";
import orderBy from "lodash/orderBy";
import logger from "../logger";
import got, { OptionsOfJSONResponseBody } from "got";
import { filter } from "lodash";

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
};

export interface HelmRepoConfig {
  repositories: HelmRepo[]
}

export interface HelmRepo {
  name: string;
  url: string;
  cacheFilePath?: string
  caFile?: string,
  certFile?: string,
  insecureSkipTlsVerify?: boolean,
  keyFile?: string,
  username?: string,
  password?: string,
}

export class HelmRepoManager extends Singleton {
  static cache = {}; // todo: remove implicit updates in helm-chart-manager.ts

  protected repos: HelmRepo[];
  protected helmEnv: HelmEnv;
  protected initialized: boolean;

  async loadAvailableRepos(): Promise<HelmRepo[]> {
    const options = {
      ...defaultGotOptions() as OptionsOfJSONResponseBody,
      timeout: 10000
    };
    const r = await got<HelmRepo[]>("https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json", options);

    return orderBy(r.body, repo => repo.name);
  }

  async init() {
    helmCli.setLogger(logger);
    await helmCli.ensureBinary();

    if (!this.initialized) {
      this.helmEnv = await this.parseHelmEnv();
      await this.update();
      this.initialized = true;
    }
  }

  protected async parseHelmEnv() {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" env`).catch((error) => {
      throw (error.stderr);
    });
    const lines = stdout.split(/\r?\n/); // split by new line feed
    const env: HelmEnv = {};

    lines.forEach((line: string) => {
      const [key, value] = line.split("=");

      if (key && value) {
        env[key] = value.replace(/"/g, ""); // strip quotas
      }
    });

    return env;
  }

  public async repositories(): Promise<HelmRepo[]> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const repoConfigFile = this.helmEnv.HELM_REPOSITORY_CONFIG;
      const { repositories }: HelmRepoConfig = await readFile(repoConfigFile, "utf8")
        .then((yamlContent: string) => yaml.safeLoad(yamlContent))
        .catch(() => ({
          repositories: []
        }));

      if (!repositories.length) {
        await this.addRepo({ name: "bitnami", url: "https://charts.bitnami.com/bitnami" });

        return await this.repositories();
      }

      return repositories.map(repo => ({
        ...repo,
        cacheFilePath: `${this.helmEnv.HELM_REPOSITORY_CACHE}/${repo.name}-index.yaml`
      }));
    } catch (error) {
      logger.error(`[HELM]: repositories listing error "${error}"`);

      return [];
    }
  }

  public async repository(name: string) {
    const repositories = await this.repositories();

    return repositories.find(repo => repo.name == name);
  }

  public async update() {
    const helm = await helmCli.binaryPath();
    const command = `"${helm}" repo update`;

    return stdOptimizedPromiseExec(command);
  }

  public async addRepo({ name, url }: HelmRepo) {
    logger.info(`[HELM]: adding repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();
    const command = `"${helm}" repo add ${name} ${url}`;

    return stdOptimizedPromiseExec(command);
  }

  public async addСustomRepo(repoAttributes : HelmRepo) {
    logger.info(`[HELM]: adding repo "${repoAttributes.name}" from ${repoAttributes.url}`);
    const helm = await helmCli.binaryPath();
    const args = filter([
      repoAttributes.insecureSkipTlsVerify && "--insecure-skip-tls-verify",
      repoAttributes.username && `--username "${repoAttributes.username}"`,
      repoAttributes.username && `--username "${repoAttributes.username}"`,
      repoAttributes.caFile && `--ca-file "${repoAttributes.caFile}"`,
      repoAttributes.keyFile && `--key-file "${repoAttributes.keyFile}"`,
      repoAttributes.certFile && `--cert-file "${repoAttributes.certFile}"`,
    ]);
    const command = `"${helm}" repo add ${repoAttributes.name} ${repoAttributes.url} ${args.join(" ")}`;

    return stdOptimizedPromiseExec(command);
  }

  public async removeRepo({ name, url }: HelmRepo): Promise<string> {
    logger.info(`[HELM]: removing repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();
    const command = `"${helm}" repo remove ${name}`;

    return stdOptimizedPromiseExec(command);
  }
}

export const repoManager = HelmRepoManager.getInstance<HelmRepoManager>();
