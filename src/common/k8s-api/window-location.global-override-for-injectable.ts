/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import windowLocationInjectable from "./window-location.injectable";

export default getGlobalOverride(windowLocationInjectable, () => ({
  host: "localhost",
  port: "12345",
}));
