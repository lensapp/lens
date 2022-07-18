/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface RawHelmChart {
  apiVersion: string;
  name: string;
  version: string;
  repo: string;
  created: string;
  digest?: string;
  kubeVersion?: string;
  description?: string;
  home?: string;
  engine?: string;
  icon?: string;
  appVersion?: string;
  type?: string;
  tillerVersion?: string;
  deprecated?: boolean;
  keywords?: string[];
  sources?: string[];
  urls?: string[];
  maintainers?: HelmChartMaintainer[];
  dependencies?: RawHelmChartDependency[];
  annotations?: Record<string, string>;
}

export interface HelmChartMaintainer {
  name: string;
  email: string;
  url?: string;
}

export interface RawHelmChartDependency {
  name: string;
  repository: string;
  condition?: string;
  version: string;
  tags?: string[];
}

export type RepoHelmChartList = Record<string, RawHelmChart[]>;
