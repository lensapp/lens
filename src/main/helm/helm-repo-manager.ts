import fs from "fs";
import logger from "../logger";
import * as yaml from "js-yaml";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
}

export type HelmRepo = {
  name: string;
  url: string;
  cacheFilePath?: string;
}

export class HelmRepoManager extends Singleton {
  static cache = {}

  protected helmEnv: HelmEnv
  protected initialized: boolean

  public async init() {
    await helmCli.ensureBinary();
    if (!this.initialized) {
      this.helmEnv = await this.parseHelmEnv()
      await this.update()
      this.initialized = true
    }
  }

  protected async parseHelmEnv() {
    const helm = await helmCli.binaryPath()
    const { stdout } = await promiseExec(`"${helm}" env`).catch((error) => {
      throw(error.stderr)
    })
    const lines = stdout.split(/\r?\n/) // split by new line feed
    const env: HelmEnv = {}
    lines.forEach((line: string) => {
      const [key, value] = line.split("=")
      if (key && value) {
        env[key] = value.replace(/"/g, "") // strip quotas
      }
    })
    return env
  }

  public async repositories(): Promise<Array<HelmRepo>> {
    if (!this.initialized) {
      await this.init()
    }
    const repositoryFilePath = this.helmEnv.HELM_REPOSITORY_CONFIG
    const repoFile = await fs.promises.readFile(repositoryFilePath, 'utf8').catch(async (error) => {
      return null
    })
    if (!repoFile) {
      await this.addRepo({ name: "stable", url: "https://kubernetes-charts.storage.googleapis.com/" })
      return await this.repositories()
    }
    try {
      const repositories = yaml.safeLoad(repoFile)
      const result = repositories['repositories'].map((repository: HelmRepo) => {
        return {
          name: repository.name,
          url: repository.url,
          cacheFilePath: `${this.helmEnv.HELM_REPOSITORY_CACHE}/${repository['name']}-index.yaml`
        }
      });
      if (result.length == 0) {
        await this.addRepo({ name: "stable", url: "https://kubernetes-charts.storage.googleapis.com/" })
        return await this.repositories()
      }
      return result
    } catch (error) {
      logger.debug(error)
      return []
    }
  }

  public async repository(name: string) {
    const repositories = await this.repositories()
    return repositories.find((repo: HelmRepo) => {
      return repo.name == name
    })
  }

  public async update() {
    const helm = await helmCli.binaryPath()
    logger.debug(`${helm} repo update`)

    const { stdout } = await promiseExec(`"${helm}" repo update`).catch((error) => {
      return { stdout: error.stdout }
    })
    return stdout
  }

  public async addRepo(repository: HelmRepo) {
    const helm = await helmCli.binaryPath()
    logger.debug(`${helm} repo add ${repository.name} ${repository.url}`)

    const { stdout } = await promiseExec(`"${helm}" repo add ${repository.name} ${repository.url}`).catch((error) => {
      throw(error.stderr)
    })
    return stdout
  }
}

export const repoManager = HelmRepoManager.getInstance<HelmRepoManager>()
