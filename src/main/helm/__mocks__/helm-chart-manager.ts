/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RawHelmChart } from "../../../common/k8s-api/endpoints";
import { sortCharts } from "../../../common/utils";
import type { HelmRepo } from "../helm-repo-manager";

const charts: Map<string, Record<string, RawHelmChart[]>> = new Map([
  ["stable", {
    "invalid-semver": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "weird-versioning",
        version: "I am not semver",
        repo: "stable",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "weird-versioning",
        version: "v4.3.0",
        repo: "stable",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "weird-versioning",
        version: "I am not semver but more",
        repo: "stable",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "weird-versioning",
        version: "v4.4.0",
        repo: "stable",
        digest: "test",
        created: "now",
      },
    ]),
    "apm-server": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "apm-server",
        version: "2.1.7",
        repo: "stable",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "apm-server",
        version: "2.1.6",
        repo: "stable",
        digest: "test",
        created: "now",
      },
    ]),
    "redis": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "apm-server",
        version: "1.0.0",
        repo: "stable",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "apm-server",
        version: "0.0.9",
        repo: "stable",
        digest: "test",
        created: "now",
      },
    ]),
  }],
  ["experiment", {
    "fairwind": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "fairwind",
        version: "0.0.1",
        repo: "experiment",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "fairwind",
        version: "0.0.2",
        repo: "experiment",
        digest: "test",
        deprecated: true,
        created: "now",
      },
    ]),
  }],
  ["bitnami", {
    "hotdog": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "hotdog",
        version: "1.0.1",
        repo: "bitnami",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "hotdog",
        version: "1.0.2",
        repo: "bitnami",
        digest: "test",
        created: "now",
      },
    ]),
    "pretzel": sortCharts([
      {
        apiVersion: "3.0.0",
        name: "pretzel",
        version: "1.0",
        repo: "bitnami",
        digest: "test",
        created: "now",
      },
      {
        apiVersion: "3.0.0",
        name: "pretzel",
        version: "1.0.1",
        repo: "bitnami",
        digest: "test",
        created: "now",
      },
    ]),
  }],
]);

export class HelmChartManager {
  constructor(private repo: HelmRepo){ }

  static forRepo(repo: HelmRepo) {
    return new this(repo);
  }

  public charts() {
    return charts.get(this.repo.name) ?? {};
  }
}
