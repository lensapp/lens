import jsYaml from "js-yaml";
import pathToRegExp from "path-to-regexp";
import { autobind, formatDuration } from "../../utils";
import capitalize from "lodash/capitalize";
import { apiKubeHelm } from "../index";
import { helmChartStore } from "../../components/+apps-helm-charts/helm-chart.store";
import { ItemObject } from "../../item.store";
import { KubeObject } from "../kube-object";
import { CancelablePromise } from "client/utils/cancelableFetch";
import { KubeJsonApiData } from "../kube-json-api";

interface ReleasePayload {
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

interface ReleaseRawDetails extends ReleasePayload {
  resources: string;
}

export interface ReleaseInfo extends ReleasePayload {
  resources: KubeObject[];
}

export interface ReleaseCreatePayload {
  name?: string;
  repo: string;
  chart: string;
  namespace: string;
  version: string;
  values: string;
}

export interface ReleaseUpdatePayload {
  repo: string;
  chart: string;
  version: string;
  values: string;
}

export interface ReleaseUpdateDetails {
  log: string;
  release: ReleaseInfo;
}

export interface ReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  description: string;
}

const endpoint = pathToRegExp.compile(`/v2/releases/:namespace?/:name?`) as (
  params?: {
    namespace?: string;
    name?: string;
  }
) => string;

@autobind()
export class HelmRelease implements ItemObject {
  constructor(data: any) {
    Object.assign(this, data);
  }

  appVersion: string
  name: string
  namespace: string
  chart: string
  status: string
  updated: string
  revision: number

  getId(): string {
    return this.namespace + this.name;
  }

  getName(): string {
    return this.name;
  }

  getChart(withVersion = false): string {
    let chart = this.chart;
    if (!withVersion && this.getVersion() != "") {
      const search = new RegExp(`-${this.getVersion()}`);
      chart = chart.replace(search, "");
    }
    return chart;
  }

  getStatus(): string {
    return capitalize(this.status);
  }

  getVersion(): string {
    return this.chart.match(/(v?\d+)[^-].*$/)?.[0] || "";
  }

  getUpdated(humanize = true, compact = true): number | string {
    const now = new Date().getTime();
    const updated = this.updated.replace(/\s\w*$/, "");  // 2019-11-26 10:58:09 +0300 MSK -> 2019-11-26 10:58:09 +0300 to pass into Date()
    const updatedDate = new Date(updated).getTime();
    const diff = now - updatedDate;
    if (humanize) {
      return formatDuration(diff, compact);
    }
    return diff;
  }

  // Helm does not store from what repository the release is installed,
  // so we have to try to guess it by searching charts
  async getRepo(): Promise<string> {
    const chartName = this.getChart();
    const version = this.getVersion();
    const versions = await helmChartStore.getVersions(chartName);
    const chartVersion = versions.find(chartVersion => chartVersion.version === version);
    return chartVersion?.repo || "";
  }
}

export const helmReleasesApi = {
  async list(namespace?: string): Promise<HelmRelease[]> {
    const releases = await apiKubeHelm.get<HelmRelease[]>(endpoint({ namespace }));
    return releases.map(data => new HelmRelease(data));
  },

  async get(name: string, namespace: string): Promise<ReleaseInfo> {
    const path = endpoint({ name, namespace });
    const details = await apiKubeHelm.get<ReleaseRawDetails>(path);
    const items: KubeObject[] = JSON.parse(details.resources).items;
    const resources = items.map(item => new KubeObject(item));
    return {
      ...details,
      resources
    };
  },

  create(payload: ReleaseCreatePayload): Promise<ReleaseUpdateDetails> {
    const { repo, ...data } = payload;
    data.chart = `${repo}/${data.chart}`;
    data.values = jsYaml.safeLoad(data.values);
    return apiKubeHelm.post(endpoint(), { data });
  },

  update(name: string, namespace: string, payload: ReleaseUpdatePayload): Promise<ReleaseUpdateDetails> {
    const { repo, ...data } = payload;
    data.chart = `${repo}/${data.chart}`;
    data.values = jsYaml.safeLoad(data.values);
    return apiKubeHelm.put(endpoint({ name, namespace }), { data });
  },

  delete(name: string, namespace: string): CancelablePromise<KubeJsonApiData> {
    const path = endpoint({ name, namespace });
    return apiKubeHelm.del(path);
  },

  getValues(name: string, namespace: string): CancelablePromise<string> {
    const path = endpoint({ name, namespace }) + "/values";
    return apiKubeHelm.get<string>(path);
  },

  getHistory(name: string, namespace: string): Promise<ReleaseRevision[]> {
    const path = endpoint({ name, namespace }) + "/history";
    return apiKubeHelm.get(path);
  },

  rollback(name: string, namespace: string, revision: number): CancelablePromise<KubeJsonApiData> {
    const path = endpoint({ name, namespace }) + "/rollback";
    return apiKubeHelm.put(path, {
      data: {
        revision: revision
      }
    });
  }
};
