import fs from "fs";
import * as yaml from "js-yaml";
import { HelmRepo, HelmRepoManager } from "./helm-repo-manager";
import logger from "../logger";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";

type CachedYaml = {
  entries: any; // todo: types
};

export class HelmChartManager {
  protected cache: any = {};
  protected repo: HelmRepo;

  constructor(repo: HelmRepo){
    this.cache = HelmRepoManager.cache;
    this.repo = repo;
  }

  public async chart(name: string) {
    const charts = await this.charts();
    return charts[name];
  }

  public async charts(): Promise<any> {
    try {
      const cachedYaml = await this.cachedYaml();
      return cachedYaml["entries"];
    } catch(error) {
      logger.error(error);
      return [];
    }
  }

  public async getReadme(name: string, version = "") {
    const helm = await helmCli.binaryPath();
    if(version && version != "") {
      const { stdout } = await promiseExec(`"${helm}" show readme ${this.repo.name}/${name} --version ${version}`).catch((error) => { throw(error.stderr);});
      return stdout;
    } else {
      const { stdout } = await promiseExec(`"${helm}" show readme ${this.repo.name}/${name}`).catch((error) => { throw(error.stderr);});
      return stdout;
    }
  }

  public async getValues(name: string, version = "") {
    const helm = await helmCli.binaryPath();
    if(version && version != "") {
      const { stdout } = await promiseExec(`"${helm}" show values ${this.repo.name}/${name} --version ${version}`).catch((error) => { throw(error.stderr);});

      return stdout;
    } else {
      const { stdout } = await promiseExec(`"${helm}" show values ${this.repo.name}/${name}`).catch((error) => { throw(error.stderr);});

      return stdout;
    }
  }

  protected async cachedYaml(): Promise<CachedYaml> {
    if (!(this.repo.name in this.cache)) {
      const cacheFile = await fs.promises.readFile(this.repo.cacheFilePath, "utf-8");
      const data = yaml.safeLoad(cacheFile);
      for(const key in data["entries"]) {
        data["entries"][key].forEach((version: any) => {
          version["repo"] = this.repo.name;
          version["created"] = Date.parse(version.created).toString();
        });
      }
      this.cache[this.repo.name] = Buffer.from(JSON.stringify(data));
    }
    return JSON.parse(this.cache[this.repo.name].toString());
  }
}
