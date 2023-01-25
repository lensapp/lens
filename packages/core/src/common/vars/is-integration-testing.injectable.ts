/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import commandLineArgumentsInjectable from "../../main/utils/command-line-arguments.injectable";

const isIntegrationTestingInjectable = getInjectable({
  id: "is-integration-testing",

  instantiate: (di) => {
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    return commandLineArguments.includes("--integration-testing");
  },
});

export default isIntegrationTestingInjectable;
