/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { object } from "@k8slens/utilities";
import getActiveHelmRepositoriesInjectable from "../repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import type { HelmRepo } from "../../../common/helm/helm-repo";
import helmChartManagerInjectable from "../helm-chart-manager.injectable";

const listHelmChartsInjectable = getInjectable({
  id: "list-helm-charts",

  instantiate: (di) => {
    const getActiveHelmRepositories = di.inject(getActiveHelmRepositoriesInjectable);
    const getChartManager = (repo: HelmRepo) => di.inject(helmChartManagerInjectable, repo);

    return async () => {
      const result = await getActiveHelmRepositories();

      assert(result.callWasSuccessful);

      const repositories = result.response;

      return object.fromEntries(
        await Promise.all(
          repositories.map(
            async (repo) =>
              [
                repo.name,
                await getChartManager(repo).charts(),
              ] as const,
          ),
        ),
      );
    };
  },
});

export default listHelmChartsInjectable;
