/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import toggleMaximizeWindowInjectable from "./toggle-maximize-window.injectable";
import { getGlobalOverrideForFunction } from "../../../../../common/test-utils/get-global-override-for-function";

export default getGlobalOverrideForFunction(toggleMaximizeWindowInjectable);
