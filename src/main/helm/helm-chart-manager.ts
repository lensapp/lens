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
import v8 from "v8";
import * as yaml from "js-yaml";
import type { HelmRepo } from "./helm-repo-manager";
import logger from "../logger";
import { promiseExec } from "../promise-exec";
import { helmCli } from "./helm-cli";
import type { RepoHelmChartList } from "../../common/k8s-api/endpoints/helm-charts.api";
import { sortCharts } from "../../common/utils";

export class HelmChartManager {
  static #cache = new Map<string, Buffer>();

  private constructor(protected repo: HelmRepo) {}

  static forRepo(repo: HelmRepo) {
    return new this(repo);
  }

  public async chartVersions(name: string) {
    const charts = await this.charts();

    return charts[name];
  }

  public async charts(): Promise<RepoHelmChartList> {
    try {
      return await this.cachedYaml();
    } catch(error) {
      logger.error("HELM-CHART-MANAGER]: failed to list charts", { error });

      return {};
    }
  }

  private async executeCommand(action: string, name: string, version?: string) {
    const helm = await helmCli.binaryPath();
    const cmd = [`"${helm}" ${action} ${this.repo.name}/${name}`];

    if (version) {
      cmd.push("--version", version);
    }

    try {
      const { stdout } = await promiseExec(cmd.join(" "));

      return stdout;
    } catch (error) {
      throw error.stderr || error;
    }
  }

  public async getReadme(name: string, version?: string) {
    return this.executeCommand("show readme", name, version);
  }

  public async getValues(name: string, version?: string) {
    return this.executeCommand("show values", name, version);
  }

  protected async cachedYaml(): Promise<RepoHelmChartList> {
    if (!HelmChartManager.#cache.has(this.repo.name)) {
      const cacheFile = await fs.promises.readFile(this.repo.cacheFilePath, "utf-8");
      const { entries } = yaml.safeLoad(cacheFile) as { entries: RepoHelmChartList };

      /**
       * Do some initial preprocessing on the data, so as to avoid needing to do it later
       * 1. Set the repo name
       * 2. Normalize the created date
       * 3. Filter out deprecated items
       */

      const normalized = Object.fromEntries(
        Object.entries(entries)
          .map(([name, charts]) => [
            name,
            sortCharts(
              charts.map(chart => ({
                ...chart,
                created: Date.parse(chart.created).toString(),
                repo: this.repo.name,
              })),
            ),
          ] as const)
          .filter(([, charts]) => !charts.every(chart => chart.deprecated))
      );

      HelmChartManager.#cache.set(this.repo.name, v8.serialize(normalized));
    }

    return v8.deserialize(HelmChartManager.#cache.get(this.repo.name));
  }
}
