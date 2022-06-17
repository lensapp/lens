/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { object } from "../../../common/utils";
import { HelmChartManager } from "../helm-chart-manager";
import getActiveHelmRepositoriesInjectable from "../repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";

const listHelmChartsInjectable = getInjectable({
  id: "list-helm-charts",

  instantiate: (di) => {
    const getActiveHelmRepositories = di.inject(getActiveHelmRepositoriesInjectable);

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
                await HelmChartManager.forRepo(repo).charts(),
              ] as const,
          ),
        ),
      );
    };
  },

  causesSideEffects: true,
});

export default listHelmChartsInjectable;
