import pathToRegExp from "path-to-regexp";
import { apiKubeHelm } from "../index";
import { stringify } from "querystring";
import { autobind } from "../../utils";
import { CancelablePromise } from "client/utils/cancelableFetch";

@autobind()
export class HelmChart {
  constructor(data: any) {
    Object.assign(this, data);
  }

  apiVersion: string
  name: string
  version: string
  repo: string
  kubeVersion?: string
  created: string
  description?: string
  digest: string
  keywords?: string[]
  home?: string
  sources?: string[]
  maintainers?: {
    name: string;
    email: string;
    url: string;
  }[]
  engine?: string
  icon?: string
  appVersion?: string
  deprecated?: boolean
  tillerVersion?: string

  getId(): string {
    return this.digest;
  }

  getName(): string {
    return this.name;
  }

  getFullName(splitter = "/"): string {
    return [this.repo, this.name].join(splitter);
  }

  getMaintainers(): Required<HelmChart["maintainers"]> {
    return this.maintainers || [];
  }

  getAppVersion(): string {
    return this.appVersion || "";
  }

  getKeywords(): Required<HelmChart["keywords"]> {
    return this.keywords || [];
  }
}

interface HelmChartList {
  [repo: string]: {
    [name: string]: HelmChart;
  };
}

export interface HelmChartDetails {
  readme: string;
  versions: HelmChart[];
}

const endpoint = pathToRegExp.compile(`/v2/charts/:repo?/:name?`) as (params?: {
  repo?: string;
  name?: string;
}) => string;

export interface HelmChartInfo {
  readme: string;
  versions: HelmChart[];
}

export const helmChartsApi = {
  list(): CancelablePromise<HelmChart[]> {
    return apiKubeHelm.get<HelmChartList>(endpoint())
      .then(data => {
        return Object.values(data)
          .reduce((allCharts, repoCharts) => allCharts.concat(Object.values(repoCharts)), [])
          .map(data => new HelmChart(data));
      });
  },

  get(repo: string, name: string, readmeVersion?: string): CancelablePromise<HelmChartInfo> {
    const path = endpoint({ repo, name });

    return apiKubeHelm.get<HelmChartDetails>(path + "?" + stringify({ version: readmeVersion }))
      .then(({ readme, versions }) => ({
        readme,
        versions: versions.map(data => new HelmChart(data))
      }));
  },

  getValues(repo: string, name: string, version: string): CancelablePromise<string> {
    return apiKubeHelm
      .get<string>(`/v2/charts/${repo}/${name}/values?` + stringify({ version }));
  }
};
