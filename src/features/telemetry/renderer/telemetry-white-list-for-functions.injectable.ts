/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const telemetryWhiteListForFunctionsInjectable = getInjectable({
  id: "telemetry-white-list-for-functions",
  instantiate: () => ["some-placeholder-injectable-id"],
  decorable: false,
});

export default telemetryWhiteListForFunctionsInjectable;
