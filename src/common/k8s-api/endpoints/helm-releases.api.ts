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
import { autoBind, formatDuration } from "../../utils";
import capitalize from "lodash/capitalize";
import { apiBase } from "../index";
import { helmChartStore } from "../../../renderer/components/+apps-helm-charts/helm-chart.store";
import type { ItemObject } from "../../item.store";
import { KubeObject } from "../kube-object";
import type { JsonApiData } from "../json-api";
import { buildURLPositional } from "../../utils/buildUrl";
import type { KubeJsonApiData } from "../kube-json-api";

interface IReleasePayload {
  name: string;
  namespace: string;
  version: string;
  config: string;  // release values
  manifest: string;
  info: {
    deleted: string;
    description: string;
    first_deployed: string;
    last_deployed: string;
    notes: string;
    status: string;
  };
}

interface IReleaseRawDetails extends IReleasePayload {
  resources: KubeJsonApiData[];
}

export interface IReleaseDetails extends IReleasePayload {
  resources: KubeObject[];
}

export interface IReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}

export interface IReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export interface IReleaseUpdateDetails {
  log: string;
  release: IReleaseDetails;
}

export interface IReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

type EndpointParams = {}
  | { namespace: string }
  | { namespace: string, name: string }
  | { namespace: string, name: string, route: string };

interface EndpointQuery {
  all?: boolean;
}

const endpoint = buildURLPositional<EndpointParams, EndpointQuery>("/v2/releases/:namespace?/:name?/:route?");

export async function listReleases(namespace?: string): Promise<HelmRelease[]> {
  const releases = await apiBase.get<HelmRelease[]>(endpoint({ namespace }));

  return releases.map(HelmRelease.create);
}

export async function getRelease(name: string, namespace: string): Promise<IReleaseDetails> {
  const path = endpoint({ name, namespace });
  const { resources: rawResources, ...details } = await apiBase.get<IReleaseRawDetails>(path);
  const resources = rawResources.map(KubeObject.create);

  return {
    ...details,
    resources,
  };
}

export async function createRelease(payload: IReleaseCreatePayload): Promise<IReleaseUpdateDetails> {
  const { repo, chart: rawChart, values: rawValues, ...data } = payload;
  const chart = `${repo}/${rawChart}`;
  const values = yaml.load(rawValues);

  return apiBase.post(endpoint(), {
    data: {
      chart,
      values,
      ...data,
    },
  });
}

export async function updateRelease(name: string, namespace: string, payload: IReleaseUpdatePayload): Promise<IReleaseUpdateDetails> {
  const { repo, chart: rawChart, values: rawValues, ...data } = payload;
  const chart = `${repo}/${rawChart}`;
  const values = yaml.load(rawValues);

  return apiBase.put(endpoint({ name, namespace }), {
    data: {
      chart,
      values,
      ...data,
    },
  });
}

export async function deleteRelease(name: string, namespace: string): Promise<JsonApiData> {
  const path = endpoint({ name, namespace });

  return apiBase.del(path);
}

export async function getReleaseValues(name: string, namespace: string, all?: boolean): Promise<string> {
  const route = "values";
  const path = endpoint({ name, namespace, route }, { all });

  return apiBase.get<string>(path);
}

export async function getReleaseHistory(name: string, namespace: string): Promise<IReleaseRevision[]> {
  const route = "history";
  const path = endpoint({ name, namespace, route });

  return apiBase.get(path);
}

export async function rollbackRelease(name: string, namespace: string, revision: number): Promise<JsonApiData> {
  const route = "rollback";
  const path = endpoint({ name, namespace, route });
  const data = { revision };

  return apiBase.put(path, { data });
}

export interface HelmRelease {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
}

export class HelmRelease implements ItemObject {
  constructor(data: any) {
    Object.assign(this, data);
    autoBind(this);
  }

  static create(data: any) {
    return new HelmRelease(data);
  }

  getId() {
    return this.namespace + this.name;
  }

  getName() {
    return this.name;
  }

  getNs() {
    return this.namespace;
  }

  getChart(withVersion = false) {
    let chart = this.chart;

    if (!withVersion && this.getVersion() != "") {
      const search = new RegExp(`-${this.getVersion()}`);

      chart = chart.replace(search, "");
    }

    return chart;
  }

  getRevision() {
    return parseInt(this.revision, 10);
  }

  getStatus() {
    return capitalize(this.status);
  }

  getVersion() {
    const versions = this.chart.match(/(?<=-)(v?\d+)[^-].*$/);

    return versions?.[0] ?? "";
  }

  getUpdated(humanize = true, compact = true) {
    const updated = this.updated.replace(/\s\w*$/, "");  // 2019-11-26 10:58:09 +0300 MSK -> 2019-11-26 10:58:09 +0300 to pass into Date()
    const updatedDate = new Date(updated).getTime();
    const diff = Date.now() - updatedDate;

    if (humanize) {
      return formatDuration(diff, compact);
    }

    return diff;
  }

  // Helm does not store from what repository the release is installed,
  // so we have to try to guess it by searching charts
  async getRepo() {
    const chartName = this.getChart();
    const version = this.getVersion();
    const versions = await helmChartStore.getVersions(chartName);
    const chartVersion = versions.find(chartVersion => chartVersion.version === version);

    return chartVersion ? chartVersion.repo : "";
  }
}
