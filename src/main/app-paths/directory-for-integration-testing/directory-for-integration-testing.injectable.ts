/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const directoryForIntegrationTestingInjectable = getInjectable({
  id: "directory-for-integration-testing",
  instantiate: () => process.env.CICD,
  causesSideEffects: true,
});

export default directoryForIntegrationTestingInjectable;
