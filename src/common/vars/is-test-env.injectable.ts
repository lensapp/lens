/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../utils/environment-variables.injectable";

const isTestEnvInjectable = getInjectable({
  id: "is-test-env",

  instantiate: (di) => {
    const { JEST_WORKER_ID: jestWorkerId } = di.inject(environmentVariablesInjectable);

    return !!jestWorkerId;
  },
});

export default isTestEnvInjectable;
