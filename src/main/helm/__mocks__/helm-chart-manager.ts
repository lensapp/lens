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

import { sortCharts } from "../../../common/utils";
import type { HelmRepo } from "../helm-repo-manager";

const charts = new Map([
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

  public async charts(): Promise<any> {
    return charts.get(this.repo.name) ?? {};
  }
}
