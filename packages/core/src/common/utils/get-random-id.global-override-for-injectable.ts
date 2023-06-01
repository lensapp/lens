/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import { getRandomIdInjectionToken } from "@k8slens/random";

export default getGlobalOverride(getRandomIdInjectionToken, () => () => "some-irrelevant-random-id");
