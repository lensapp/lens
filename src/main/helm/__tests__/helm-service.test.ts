/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { helmService } from "../helm-service";
import { HelmRepoManager } from "../helm-repo-manager";

const mockHelmRepoManager = jest.spyOn(HelmRepoManager, "getInstance").mockImplementation();

jest.mock("../helm-chart-manager");

describe("Helm Service tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("list charts with deprecated entries", async () => {
    mockHelmRepoManager.mockReturnValue({
      init: jest.fn(),
      repositories: jest.fn().mockImplementation(() => {
        return [
          { name: "stable", url: "stableurl" },
          { name: "experiment", url: "experimenturl" },
        ];
      }),
    });

    const charts = await helmService.listCharts();

    expect(charts).toEqual({
      stable: {
        "apm-server": [
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
        ],
        "invalid-semver": [
          {
            apiVersion: "3.0.0",
            name: "weird-versioning",
            version: "v4.4.0",
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
            version: "I am not semver",
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
        ],
        "redis": [
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
        ],
      },
      experiment: {
        "fairwind": [
          {
            apiVersion: "3.0.0",
            name: "fairwind",
            version: "0.0.2",
            repo: "experiment",
            digest: "test",
            deprecated: true,
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "fairwind",
            version: "0.0.1",
            repo: "experiment",
            digest: "test",
            created: "now",
          },
        ],
      },
    });
  });

  it("list charts sorted by version in descending order", async () => {
    mockHelmRepoManager.mockReturnValue({
      init: jest.fn(),
      repositories: jest.fn().mockImplementation(() => {
        return [
          { name: "bitnami", url: "bitnamiurl" },
        ];
      }),
    });

    const charts = await helmService.listCharts();

    expect(charts).toEqual({
      bitnami: {
        "hotdog": [
          {
            apiVersion: "3.0.0",
            name: "hotdog",
            version: "1.0.2",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "hotdog",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
        ],
        "pretzel": [
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
        ],
      },
    });
  });
});
