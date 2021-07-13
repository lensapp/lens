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

import fs from "fs";
import * as yaml from "js-yaml";
import { HelmRepo, HelmRepoManager } from "./helm-repo-manager";
import logger from "../logger";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import type { RepoHelmChartList } from "../../renderer/api/endpoints/helm-charts.api";

type CachedYaml = {
  entries: RepoHelmChartList
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

  public async charts(): Promise<RepoHelmChartList> {
    try {
      const cachedYaml = await this.cachedYaml();

      return cachedYaml["entries"];
    } catch(error) {
      logger.error("HELM-CHART-MANAGER]: failed to list charts", { error });

      return {};
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
