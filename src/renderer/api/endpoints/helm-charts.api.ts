import { compile } from "path-to-regexp";
import { apiBase } from "../index";
import { stringify } from "querystring";
import { autobind } from "../../utils";

export type RepoHelmChartList = Record<string, HelmChart[]>;
export type HelmChartList = Record<string, RepoHelmChartList>;

export interface IHelmChartDetails {
  readme: string;
  versions: HelmChart[];
}

const endpoint = compile(`/v2/charts/:repo?/:name?`) as (params?: {
  repo?: string;
  name?: string;
}) => string;

export const helmChartsApi = {
  list() {
    return apiBase
      .get<HelmChartList>(endpoint())
      .then(data => {
        return Object
          .values(data)
          .reduce((allCharts, repoCharts) => allCharts.concat(Object.values(repoCharts)), [])
          .map(([chart]) => HelmChart.create(chart));
      });
  },

  get(repo: string, name: string, readmeVersion?: string, reqInit?: RequestInit) {
    const path = endpoint({ repo, name });

    return apiBase
      .get<IHelmChartDetails>(`${path}?${stringify({ version: readmeVersion })}`, undefined, reqInit)
      .then(data => {
        const versions = data.versions.map(HelmChart.create);
        const readme = data.readme;

        return {
          readme,
          versions,
        };
      });
  },

  getValues(repo: string, name: string, version: string) {
    return apiBase
      .get<string>(`/v2/charts/${repo}/${name}/values?${stringify({ version })}`);
  }
};

@autobind()
export class HelmChart {
  constructor(data: any) {
    Object.assign(this, data);
  }

  static create(data: any) {
    return new HelmChart(data);
  }

  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  kubeVersion?: string;
  created: string;
  description?: string;
  digest: string;
  keywords?: string[];
  home?: string;
  sources?: string[];
  maintainers?: {
    name: string;
    email: string;
    url: string;
  }[];
  engine?: string;
  icon?: string;
  appVersion?: string;
  deprecated?: boolean;
  tillerVersion?: string;

  getId() {
    return `${this.apiVersion}/${this.name}@${this.getAppVersion()}`;
  }

  getName() {
    return this.name;
  }

  getFullName(splitter = "/") {
    return [this.getRepository(), this.getName()].join(splitter);
  }

  getDescription() {
    return this.description;
  }

  getIcon() {
    return this.icon;
  }

  getHome() {
    return this.home;
  }

  getMaintainers() {
    return this.maintainers || [];
  }

  getVersion() {
    return this.version;
  }

  getRepository() {
    return this.repo;
  }

  getAppVersion() {
    return this.appVersion || "";
  }

  getKeywords() {
    return this.keywords || [];
  }
}
