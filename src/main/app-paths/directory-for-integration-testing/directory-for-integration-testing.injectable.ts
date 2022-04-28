/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../../../common/utils/environment-variables.injectable";

const directoryForIntegrationTestingInjectable = getInjectable({
  id: "directory-for-integration-testing",

  instantiate: (di) => {
    const environmentVariables = di.inject(environmentVariablesInjectable);

    return environmentVariables.CICD;
  },
});

export default directoryForIntegrationTestingInjectable;
