/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isIntegrationTestingInjectable = getInjectable({
  id: "is-integration-testing",
  instantiate: () => process.argv.includes("--integration-testing"),
  causesSideEffects: true,
});

export default isIntegrationTestingInjectable;
