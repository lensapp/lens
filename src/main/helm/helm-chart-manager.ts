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
import logger from "../../common/logger";
import { promiseExecFile } from "../../common/utils/promise-exec";
import { helmCli } from "./helm-cli";
import type { RepoHelmChartList } from "../../common/k8s-api/endpoints/helm-charts.api";
import { iter, sortCharts } from "../../common/utils";

interface ChartCacheEntry {
  data: Buffer,
  mtimeMs: number,
}

export interface HelmCacheFile {
  apiVersion: string;
  entries: RepoHelmChartList;
}

export class HelmChartManager {
  static #cache = new Map<string, ChartCacheEntry>();

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

  private async executeCommand(args: string[], name: string, version?: string) {
    const helm = await helmCli.binaryPath();

    args.push(`${this.repo.name}/${name}`);

    if (version) {
      args.push("--version", version);
    }

    try {
      const { stdout } = await promiseExecFile(helm, args);

      return stdout;
    } catch (error) {
      throw error.stderr || error;
    }
  }

  public async getReadme(name: string, version?: string) {
    return this.executeCommand(["show", "readme"], name, version);
  }

  public async getValues(name: string, version?: string) {
    return this.executeCommand(["show", "values"], name, version);
  }

  protected async updateYamlCache() {
    const cacheFile = await fs.promises.readFile(this.repo.cacheFilePath, "utf-8");
    const cacheFileStats = await fs.promises.stat(this.repo.cacheFilePath);
    const data = yaml.load(cacheFile) as string | number | HelmCacheFile;

    if (!data || typeof data !== "object" || typeof data.entries !== "object") {
      throw Object.assign(new TypeError("Helm Cache file does not parse correctly"), { file: this.repo.cacheFilePath, data });
    }

    const normalized = normalizeHelmCharts(this.repo.name, data.entries);

    HelmChartManager.#cache.set(this.repo.name, {
      data: v8.serialize(normalized),
      mtimeMs: cacheFileStats.mtimeMs,
    });
  }

  protected async cachedYaml(): Promise<RepoHelmChartList> {
    if (!HelmChartManager.#cache.has(this.repo.name)) {
      await this.updateYamlCache();
    } else {
      const newStats = await fs.promises.stat(this.repo.cacheFilePath);
      const cacheEntry = HelmChartManager.#cache.get(this.repo.name);

      if (cacheEntry.mtimeMs < newStats.mtimeMs) {
        await this.updateYamlCache();
      }
    }

    return v8.deserialize(HelmChartManager.#cache.get(this.repo.name).data);
  }
}

/**
 * Do some initial preprocessing on the data, so as to avoid needing to do it later
 * 1. Set the repo name
 * 2. Normalize the created date
 * 3. Filter out charts that only have deprecated entries
 */
function normalizeHelmCharts(repoName: string, entries: RepoHelmChartList): RepoHelmChartList {
  return Object.fromEntries(
    iter.filter(
      iter.map(
        Object.entries(entries),
        ([name, charts]) => [
          name,
          sortCharts(
            charts.map(chart => ({
              ...chart,
              created: Date.parse(chart.created).toString(),
              repo: repoName,
            })),
          ),
        ] as const,
      ),
      ([, charts]) => !charts.every(chart => chart.deprecated),
    ),
  );
}
