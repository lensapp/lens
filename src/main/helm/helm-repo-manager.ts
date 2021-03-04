import yaml from "js-yaml";
import { readFile } from "fs-extra";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";
import { customRequestPromise } from "../../common/request";
import orderBy from "lodash/orderBy";
import logger from "../logger";
import * as util from "util";

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
    const res = await customRequestPromise({
      uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });

    return orderBy<HelmRepo>(res.body, repo => repo.name);
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
    const stdout = await this.execHelm(["env"]);

    return Object.fromEntries(
      stdout.split(/\r?\n/) // split by new line feed
        .filter(Boolean) // ignore empty lines
        .map(line => line.split("="))
        .map(([key, value]) => [key, value.replaceAll("\"", "")])
    );
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

  /**
   * Executes helm with the provided args returning the STDOUT or throwing the STDERR (if error)
   * @param args the list of args to call helm with
   */
  protected async execHelm(args: string[]): Promise<string> {
    const helmPath = util.inspect(helmCli.binaryPath());
    const argsStr = args.filter(Boolean).join(" ");
    const command = `${helmPath} ${argsStr}`;

    try {
      return (await promiseExec(command)).stdout;
    } catch ({ stderr }) {
      throw stderr;
    }
  }

  public async update() {
    return this.execHelm([
      "repo",
      "update",
    ]);
  }

  public async addRepo(repoInfo: HelmRepo) {
    const { name, url, insecureSkipTlsVerify, username, password, caFile, keyFile, certFile } = repoInfo;

    logger.info(`[HELM]: adding repo "${name}" from ${url}`);

    return this.execHelm([
      "repo",
      "add",
      util.inspect(name),
      util.inspect(url),
      insecureSkipTlsVerify && "--insecure-skip-tls-verify",
      username && `--username=${util.inspect(username)}`,
      password && `--password=${util.inspect(password)}`,
      caFile && `--ca-file=${util.inspect(caFile)}`,
      keyFile && `--key-file=${util.inspect(keyFile)}`,
      certFile && `--cert-file=${util.inspect(keyFile)}`,
    ]);
  }

  public async removeRepo({ name, url }: HelmRepo): Promise<string> {
    logger.info(`[HELM]: removing repo "${name}" from ${url}`);

    return this.execHelm([
      "repo",
      "remove",
      util.inspect(name),
    ]);
  }
}

export const repoManager = HelmRepoManager.getInstance<HelmRepoManager>();
