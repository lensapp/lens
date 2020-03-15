import * as fs from "fs";
import logger from "./logger";
import * as yaml from "js-yaml";
import { promiseExec } from "./promise-exec";
import { helmCli } from "./helm-cli";

type HelmEnv = {
  [key: string]: string | undefined;
}

export type HelmRepo = {
  name: string;
  url: string;
  cacheFilePath?: string;
}

export class HelmRepoManager {
  private static instance: HelmRepoManager;
  public static cache = {}
  protected helmEnv: HelmEnv
  protected initialized: boolean

  static getInstance(): HelmRepoManager {
    if(!HelmRepoManager.instance) {
      HelmRepoManager.instance = new HelmRepoManager()
    }
    return HelmRepoManager.instance;
  }

  private constructor() {
    // use singleton getInstance()
  }

  public async init() {
    const helm = await helmCli.binaryPath()
    if (!this.initialized) {
      this.helmEnv = await this.parseHelmEnv()
      await this.update()
      this.initialized = true
    }
  }

  protected async parseHelmEnv() {
    const helm = await helmCli.binaryPath()
    const { stdout } = await promiseExec(`"${helm}" env`).catch((error) => { throw(error.stderr)})
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
    if(!this.initialized) {
      await this.init()
    }
    const repositoryFilePath = this.helmEnv.HELM_REPOSITORY_CONFIG
    const repoFile = await fs.promises.readFile(repositoryFilePath, 'utf8').catch(async (error) => {
      return null
    })
    if(!repoFile) {
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

    const {stdout } = await promiseExec(`"${helm}" repo update`).catch((error) => { return { stdout: error.stdout } })
    return stdout
  }

  protected async addRepositories(repositories: HelmRepo[]){
    const currentRepositories = await this.repositories()
    repositories.forEach(async (repo: HelmRepo) => {
      try {
        const repoExists = currentRepositories.find((currentRepo: HelmRepo) => {
          return currentRepo.url == repo.url
        })
        if(!repoExists) {
          await this.addRepo(repo)
        }
      }
      catch(error) {
        logger.error(JSON.stringify(error))
      }
    });
  }

  protected async pruneRepositories(repositoriesToKeep: HelmRepo[]) {
    const repositories = await this.repositories()
    repositories.filter((repo: HelmRepo) => {
      return repositoriesToKeep.find((repoToKeep: HelmRepo) => {
        return repo.name == repoToKeep.name
      }) === undefined
    }).forEach(async (repo: HelmRepo) => {
      try {
        const output = await this.removeRepo(repo)
        logger.debug(output)
      } catch(error) {
        logger.error(error)
      }
    })

  }

  public async addRepo(repository: HelmRepo) {
    const helm = await helmCli.binaryPath()
    logger.debug(`${helm} repo add ${repository.name} ${repository.url}`)

    const {stdout } = await promiseExec(`"${helm}" repo add ${repository.name} ${repository.url}`).catch((error) => { throw(error.stderr)})
    return stdout
  }

  public async removeRepo(repository: HelmRepo): Promise<string> {
    const helm = await helmCli.binaryPath()
    logger.debug(`${helm} repo remove ${repository.name} ${repository.url}`)

    const { stdout, stderr } = await promiseExec(`"${helm}" repo remove ${repository.name}`).catch((error) => { throw(error.stderr)})
    return stdout
  }
}

export const repoManager = HelmRepoManager.getInstance()
