/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverrideForFunction } from "../../../common/test-utils/get-global-override-for-function";
import showErrorPopupInjectable from "./show-error-popup.injectable";

export default getGlobalOverrideForFunction(showErrorPopupInjectable);
