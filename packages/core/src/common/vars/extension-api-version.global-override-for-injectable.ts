/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import extensionApiVersionInjectable from "./extension-api-version.injectable";

export default getGlobalOverride(extensionApiVersionInjectable, () => "6.0.0");
