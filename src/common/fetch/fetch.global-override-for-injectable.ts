/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverrideForFunction } from "../test-utils/get-global-override-for-function";
import fetchInjectable from "./fetch.injectable";

export default getGlobalOverrideForFunction(fetchInjectable);
