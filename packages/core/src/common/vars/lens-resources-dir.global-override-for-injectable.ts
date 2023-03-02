/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import lensResourcesDirInjectable from "./lens-resources-dir.injectable";

export default getGlobalOverride(lensResourcesDirInjectable, () => "/irrelavent-dir-for-lens-resources");
