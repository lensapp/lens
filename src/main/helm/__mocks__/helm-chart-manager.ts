import { HelmRepo, HelmRepoManager } from "../helm-repo-manager";

export class HelmChartManager {
  private cache: any = {};
  private repo: HelmRepo;

  constructor(repo: HelmRepo){
    this.cache = HelmRepoManager.cache;
    this.repo = repo;
  }

  public async charts(): Promise<any> {
    switch (this.repo.name) {
      case "stable":
        return Promise.resolve({
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
        });
      case "experiment":
        return Promise.resolve({
          "fairwind": [
            {
              apiVersion: "3.0.0",
              name: "fairwind",
              version: "0.0.1",
              repo: "experiment",
              digest: "test"
            },
            {
              apiVersion: "3.0.0",
              name: "fairwind",
              version: "0.0.2",
              repo: "experiment",
              digest: "test",
              deprecated: true
            }
          ]
        });
      case "bitnami":
        return Promise.resolve({
          "hotdog": [
            {
              apiVersion: "3.0.0",
              name: "hotdog",
              version: "1.0.1",
              repo: "bitnami",
              digest: "test"
            },
            {
              apiVersion: "3.0.0",
              name: "hotdog",
              version: "1.0.2",
              repo: "bitnami",
              digest: "test",
            }
          ],
          "pretzel": [
            {
              apiVersion: "3.0.0",
              name: "pretzel",
              version: "1.0",
              repo: "bitnami",
              digest: "test",
            },
            {
              apiVersion: "3.0.0",
              name: "pretzel",
              version: "1.0.1",
              repo: "bitnami",
              digest: "test"
            }
          ]
        });
      default:
        return Promise.resolve({});
    }
  }
}
