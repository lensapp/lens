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

import { observable } from "mobx";
import { HelmRepository } from "../../common/catalog-entities";
import { catalogEntityRegistry } from "../catalog";
import { HelmRepoManager } from "../helm/helm-repo-manager";

export function syncHelmRepositories() {
  const repos = observable.array([]);

  setTimeout(() => {
    HelmRepoManager.loadAvailableRepos().then((helmRepos) => {
      repos.replace(helmRepos.map((helmRepo) => {
        const labels: Record<string, string> = {};

        if (helmRepo.verifiedPublisher) {
          labels["verified-publisher"] = "true";
        }

        if (helmRepo.official) {
          labels["official"] = "true";
        }

        return new HelmRepository({
          metadata: {
            uid: helmRepo.id || helmRepo.url,
            name: helmRepo.name,
            source: "ArtifactHub.io",
            labels
          },
          spec: {
            ...helmRepo
          },
          status: {
            phase: "available"
          }
        });
      }));
    });
  }, 5000);

  catalogEntityRegistry.addObservableSource("helm-repositories", repos);
}
