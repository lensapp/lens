/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import getRandomIdInjectable from "./get-random-id.injectable";

export default getGlobalOverride(getRandomIdInjectable, () => () => "some-irrelevant-random-id");
