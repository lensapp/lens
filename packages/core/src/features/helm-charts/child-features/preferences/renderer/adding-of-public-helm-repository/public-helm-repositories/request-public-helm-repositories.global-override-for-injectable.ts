/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverrideForFunction } from "../../../../../../../../../utility-features/test-utils/src/get-global-override-for-function";
import requestPublicHelmRepositoriesInjectable from "./request-public-helm-repositories.injectable";

export default getGlobalOverrideForFunction(requestPublicHelmRepositoriesInjectable);
