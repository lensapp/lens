/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sortBy } from "lodash/fp";
import type { HelmRepo } from "../../../../../../../common/helm/helm-repo";
import { customRequestPromise } from "../../../../../../../common/request";

const callForPublicHelmRepositoriesInjectable = getInjectable({
  id: "call-for-public-helm-repositories",

  instantiate: () => async (): Promise<HelmRepo[]> => {
    const res = await customRequestPromise({
      uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });

    const repositories = res.body as HelmRepo[];

    return sortBy(repo => repo.name, repositories);
  },

  causesSideEffects: true,
});

export default callForPublicHelmRepositoriesInjectable;
