/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import hardwareAccelerationShouldBeDisabledInjectable from "./hardware-acceleration-should-be-disabled.injectable";

export default getGlobalOverride(hardwareAccelerationShouldBeDisabledInjectable, () => false);
