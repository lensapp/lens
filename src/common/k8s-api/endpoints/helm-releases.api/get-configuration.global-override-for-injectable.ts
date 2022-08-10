/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../test-utils/get-global-override";
import requestHelmReleaseConfigurationInjectable from "./get-configuration.injectable";

export default getGlobalOverride(requestHelmReleaseConfigurationInjectable, () => () => {
  throw new Error("Tried to call requestHelmReleaseConfiguration with no override");
});
