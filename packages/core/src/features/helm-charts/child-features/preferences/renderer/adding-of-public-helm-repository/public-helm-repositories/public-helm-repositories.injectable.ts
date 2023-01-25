/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import requestPublicHelmRepositoriesInjectable from "./request-public-helm-repositories.injectable";

const publicHelmRepositoriesInjectable = getInjectable({
  id: "public-helm-repositories",

  instantiate: (di) => asyncComputed({
    getValueFromObservedPromise: di.inject(requestPublicHelmRepositoriesInjectable),
    valueWhenPending: [],
  }),
});

export default publicHelmRepositoriesInjectable;
