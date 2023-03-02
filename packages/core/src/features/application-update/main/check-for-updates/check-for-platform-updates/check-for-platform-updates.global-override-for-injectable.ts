/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import checkForPlatformUpdatesInjectable from "./check-for-platform-updates.injectable";
import { getGlobalOverrideForFunction } from "../../../../../../../utility-features/test-utils/src/get-global-override-for-function";

export default getGlobalOverrideForFunction(checkForPlatformUpdatesInjectable);
