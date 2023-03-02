/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import goForwardInjectable from "./go-forward.injectable";
import { getGlobalOverrideForFunction } from "@k8slens/test-utils";

export default getGlobalOverrideForFunction(goForwardInjectable);
