/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing.injectable";

export default getGlobalOverride(directoryForIntegrationTestingInjectable, () => undefined);
