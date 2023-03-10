/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import requestHelmReleaseConfigurationInjectable from "./request-configuration.injectable";

export default getGlobalOverride(requestHelmReleaseConfigurationInjectable, () => () => {
  throw new Error("Tried to call requestHelmReleaseConfiguration with no override");
});
