/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import yaml from "js-yaml";
import { readFile } from "fs-extra";
import { promiseExec } from "../../common/utils/promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";
import { customRequestPromise } from "../../common/request";
import orderBy from "lodash/orderBy";
import logger from "../logger";

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
  protected repos: HelmRepo[];
  protected helmEnv: HelmEnv;
  protected initialized: boolean;

  public static async loadAvailableRepos(): Promise<HelmRepo[]> {
    const res = await customRequestPromise({
      uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });

    return orderBy<HelmRepo>(res.body, repo => repo.name);
  }

  private async init() {
    helmCli.setLogger(logger);
    await helmCli.ensureBinary();

    if (!this.initialized) {
      this.helmEnv = await HelmRepoManager.parseHelmEnv();
      await HelmRepoManager.update();
      this.initialized = true;
    }
  }

  protected static async parseHelmEnv() {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" env`).catch((error) => {
      throw(error.stderr);
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

  public async repo(name: string): Promise<HelmRepo> {
    const repos = await this.repositories();

    return repos.find(repo => repo.name === name);
  }

  private async readConfig(): Promise<HelmRepoConfig> {
    try {
      const rawConfig = await readFile(this.helmEnv.HELM_REPOSITORY_CONFIG, "utf8");
      const parsedConfig = yaml.load(rawConfig);

      if (typeof parsedConfig === "object" && parsedConfig) {
        return parsedConfig as HelmRepoConfig;
      }
    } catch { }

    return {
      repositories: []
    };
  }

  public async repositories(): Promise<HelmRepo[]> {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const { repositories } = await this.readConfig();

      if (!repositories.length) {
        await HelmRepoManager.addRepo({ name: "bitnami", url: "https://charts.bitnami.com/bitnami" });

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

  public static async update() {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" repo update`).catch((error) => {
      return { stdout: error.stdout };
    });

    return stdout;
  }

  public static async addRepo({ name, url }: HelmRepo) {
    logger.info(`[HELM]: adding repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" repo add ${name} ${url}`).catch((error) => {
      throw(error.stderr);
    });

    return stdout;
  }

  public static async addCustomRepo(repoAttributes : HelmRepo) {
    logger.info(`[HELM]: adding repo "${repoAttributes.name}" from ${repoAttributes.url}`);
    const helm = await helmCli.binaryPath();

    const insecureSkipTlsVerify = repoAttributes.insecureSkipTlsVerify ? " --insecure-skip-tls-verify" : "";
    const username = repoAttributes.username ? ` --username "${repoAttributes.username}"` : "";
    const password = repoAttributes.password ? ` --password "${repoAttributes.password}"` : "";
    const caFile = repoAttributes.caFile ? ` --ca-file "${repoAttributes.caFile}"` : "";
    const keyFile = repoAttributes.keyFile ? ` --key-file "${repoAttributes.keyFile}"` : "";
    const certFile = repoAttributes.certFile ? ` --cert-file "${repoAttributes.certFile}"` : "";

    const addRepoCommand = `"${helm}" repo add ${repoAttributes.name} ${repoAttributes.url}${insecureSkipTlsVerify}${username}${password}${caFile}${keyFile}${certFile}`;
    const { stdout } = await promiseExec(addRepoCommand).catch((error) => {
      throw(error.stderr);
    });

    return stdout;
  }

  public static async removeRepo({ name, url }: HelmRepo): Promise<string> {
    logger.info(`[HELM]: removing repo "${name}" from ${url}`);
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" repo remove ${name}`).catch((error) => {
      throw(error.stderr);
    });

    return stdout;
  }
}
