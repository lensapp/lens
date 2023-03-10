/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import isDebuggingInjectable from "./is-debugging.injectable";

export default getGlobalOverride(isDebuggingInjectable, () => false);
