/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import callForPublicHelmRepositoriesInjectable from "./call-for-public-helm-repositories.injectable";

const publicHelmRepositoriesInjectable = getInjectable({
  id: "public-helm-repositories",

  instantiate: (di) => {
    const callForPublicHelmRepositories = di.inject(callForPublicHelmRepositoriesInjectable);

    return asyncComputed({
      getValueFromObservedPromise: callForPublicHelmRepositories,
      valueWhenPending: [],
    });
  },
});

export default publicHelmRepositoriesInjectable;
