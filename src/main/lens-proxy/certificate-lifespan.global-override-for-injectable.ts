/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import lensProxyCertificateLifespanInjectable from "./certificate-lifespan.injectable";

// Update this value in a hundred years :D
export default getGlobalOverride(lensProxyCertificateLifespanInjectable, () => 100 * 365);
