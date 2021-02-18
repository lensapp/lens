import { HelmRepo, HelmRepoManager } from "../helm-repo-manager";

export class HelmChartManager {
  private cache: any = {};
  private repo: HelmRepo;

  constructor(repo: HelmRepo){
    this.cache = HelmRepoManager.cache;
    this.repo = repo;
  }

  public async charts(): Promise<any> {
    return new Promise((resolve, reject) => {
      let groups: any = {};

      if (this.repo.name == "stable") {
        groups = {
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
        };
      }

      if (this.repo.name == "experiment") {
        groups = {
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
        };
      }

      if (this.repo.name == "bitnami") {
        groups = {
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
              version: "1.0.0-beta2",
              repo: "bitnami",
              digest: "test",
            },
            {
              apiVersion: "3.0.0",
              name: "pretzel",
              version: "1.0.0",
              repo: "bitnami",
              digest: "test"
            }
          ]
        };
      }

      resolve(groups);
    });
  }
}
