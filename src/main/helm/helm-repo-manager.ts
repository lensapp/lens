import yaml from "js-yaml";
import { readFile } from "fs-extra";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";
import { customRequestPromise } from "../../common/request";
import orderBy from "lodash/orderBy";
import logger from "../logger";
import { AssertionError } from "assert";

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE: string;
  HELM_REPOSITORY_CONFIG: string;
};

export interface HelmRepoConfig {
  repositories: HelmRepo[]
}

export interface HelmRepo {
  name: string;
  url: string;
  cacheFilePath: string
  caFile?: string,
  certFile?: string,
  insecureSkipTlsVerify?: boolean,
  keyFile?: string,
  username?: string,
  password?: string,
}

export class HelmRepoManager extends Singleton {
  static cache = {}; // todo: remove implicit updates in helm-chart-manager.ts

  protected repos: HelmRepo[] = [];
  protected helmEnv?: HelmEnv;

  async loadAvailableRepos(): Promise<HelmRepo[]> {
    const res = await customRequestPromise({
      uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });

    return orderBy<HelmRepo>(res.body, repo => repo.name);
  }

  async init(): Promise<HelmEnv> {
    helmCli.setLogger(logger);
    await helmCli.ensureBinary();

    try {
      return this.helmEnv ?? await this.parseHelmEnv();
    } finally {
      await this.update();
    }
  }

  protected async parseHelmEnv(): Promise<HelmEnv> {
    const helm = await helmCli.binaryPath();

    try {
      const { stdout } = await promiseExec(`"${helm}" env`);
      const envEntries = stdout.split(/\r?\n/) // split by new line feed
        .map(line => line.split("="))
        .filter(line => line.length === 2)
        .map(([key, value]) => [key, value.replace(/"/g, "")]); // strip quotas
      const env = Object.fromEntries(envEntries);

      if (!env.HELM_REPOSITORY_CACHE || !env.HELM_REPOSITORY_CONFIG) {
        throw new AssertionError({
          actual: env,
          message: "HELM_REPOSITORY_CACHE and HELM_REPOSITORY_CONFIG must be defined"
        });
      }

      return env as HelmEnv;
    } catch (error) {
      throw error.stderr;
    }
  }

  public async repositories(): Promise<HelmRepo[]> {
    const helmEnv = await this.init();

    try {
      const repoConfigFile = helmEnv.HELM_REPOSITORY_CONFIG;
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
        cacheFilePath: `${helmEnv.HELM_REPOSITORY_CACHE}/${repo.name}-index.yaml`
      }));
    } catch (error) {
      logger.error(`[HELM]: repositories listing error "${error}"`);

      return [];
    }
  }

  public async repository(name?: string) {
    const repositories = await this.repositories();

    return repositories.find(repo => repo.name == name);
  }

  public async update() {
    const helm = await helmCli.binaryPath();

    try {
      return (await promiseExec(`"${helm}" repo update`)).stdout;
    } catch (error) {
      return error.stdout;
    }
  }

  public async addRepo({ name, url }: { name: string, url: string }) {
    logger.info(`[HELM]: adding repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();

    try {
      return (await promiseExec(`"${helm}" repo add ${name} ${url}`)).stdout;
    } catch (error) {
      return error.stdout;
    }
  }

  public async addСustomRepo(repoAttributes : HelmRepo) {
    logger.info(`[HELM]: adding repo "${repoAttributes.name}" from ${repoAttributes.url}`);
    const helm = await helmCli.binaryPath();

    const insecureSkipTlsVerify = repoAttributes.insecureSkipTlsVerify ? " --insecure-skip-tls-verify" : "";
    const username = repoAttributes.username ? ` --username "${repoAttributes.username}"` : "";
    const password = repoAttributes.password ? ` --password "${repoAttributes.password}"` : "";
    const caFile = repoAttributes.caFile ? ` --ca-file "${repoAttributes.caFile}"` : "";
    const keyFile = repoAttributes.keyFile ? ` --key-file "${repoAttributes.keyFile}"` : "";
    const certFile = repoAttributes.certFile ? ` --cert-file "${repoAttributes.certFile}"` : "";

    const addRepoCommand = `"${helm}" repo add ${repoAttributes.name} ${repoAttributes.url}${insecureSkipTlsVerify}${username}${password}${caFile}${keyFile}${certFile}`;

    try {
      return (await promiseExec(addRepoCommand)).stdout;
    } catch (error) {
      return error.stdout;
    }
  }

  public async removeRepo({ name, url }: HelmRepo): Promise<string> {
    logger.info(`[HELM]: removing repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();

    try {
      return (await promiseExec(`"${helm}" repo remove ${name} ${url}`)).stdout;
    } catch (error) {
      return error.stdout;
    }
  }
}

export const repoManager = HelmRepoManager.getInstance<HelmRepoManager>();
