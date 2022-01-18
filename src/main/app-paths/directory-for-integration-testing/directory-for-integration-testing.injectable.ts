/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const directoryForIntegrationTestingInjectable = getInjectable({
  instantiate: () => process.env.CICD,
  lifecycle: lifecycleEnum.singleton,
});

export default directoryForIntegrationTestingInjectable;
