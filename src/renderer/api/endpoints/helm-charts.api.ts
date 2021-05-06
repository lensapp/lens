import { compile } from "path-to-regexp";
import { apiBase } from "../index";
import { stringify } from "querystring";
import { autoBind } from "../../utils";

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

/**
 * Get a list of all helm charts from all saved helm repos
 */
export async function listCharts(): Promise<HelmChart[]> {
  const data = await apiBase.get<HelmChartList>(endpoint());

  return Object
    .values(data)
    .reduce((allCharts, repoCharts) => allCharts.concat(Object.values(repoCharts)), [])
    .map(([chart]) => HelmChart.create(chart));
}

export interface GetChartDetailsOptions {
  version?: string;
  reqInit?: RequestInit;
}

/**
 * Get the readme and all versions of a chart
 * @param repo The repo to get from
 * @param name The name of the chart to request the data of
 * @param options.version The version of the chart's readme to get, default latest
 * @param options.reqInit A way for passing in an abort controller or other browser request options
 */
export async function getChartDetails(repo: string, name: string, { version, reqInit }: GetChartDetailsOptions = {}): Promise<IHelmChartDetails> {
  const path = endpoint({ repo, name });

  const { readme, ...data } = await apiBase.get<IHelmChartDetails>(`${path}?${stringify({ version })}`, undefined, reqInit);
  const versions = data.versions.map(HelmChart.create);

  return {
    readme,
    versions,
  };
}

/**
 * Get chart values related to a specific repos' version of a chart
 * @param repo The repo to get from
 * @param name The name of the chart to request the data of
 * @param version The version to get the values from
 */
export async function getChartValues(repo: string, name: string, version: string): Promise<string> {
  return apiBase.get<string>(`/v2/charts/${repo}/${name}/values?${stringify({ version })}`);
}

export class HelmChart {
  constructor(data: any) {
    Object.assign(this, data);
    autoBind(this);
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
    return `${this.repo}:${this.apiVersion}/${this.name}@${this.getAppVersion()}+${this.digest}`;
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
