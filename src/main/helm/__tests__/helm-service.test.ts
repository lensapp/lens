import { helmService } from "../helm-service";
import { HelmRepoManager } from "../helm-repo-manager";

const mockHelmRepoManager = jest.spyOn(HelmRepoManager, "getInstance").mockImplementation();

jest.mock("../helm-chart-manager");

describe("Helm Service tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("list charts without deprecated ones", async () => {
    mockHelmRepoManager.mockReturnValue({
      init: jest.fn(),
      repositories: jest.fn().mockImplementation(async () => {
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
            digest: "test"
          },
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "2.1.6",
            repo: "stable",
            digest: "test"
          }
        ],
        "redis": [
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "1.0.0",
            repo: "stable",
            digest: "test"
          },
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "0.0.9",
            repo: "stable",
            digest: "test"
          }
        ]
      },
      experiment: {}
    });
  });

  it("list charts sorted by version in descending order", async () => {
    mockHelmRepoManager.mockReturnValue({
      init: jest.fn(),
      repositories: jest.fn().mockImplementation(async () => {
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
          },
          {
            apiVersion: "3.0.0",
            name: "hotdog",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test"
          },
        ],
        "pretzel": [
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test",
          },
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0",
            repo: "bitnami",
            digest: "test"
          }
        ]
      }
    });
  });
});
