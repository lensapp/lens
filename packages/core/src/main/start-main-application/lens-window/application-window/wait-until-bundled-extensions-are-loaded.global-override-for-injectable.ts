/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../../../common/test-utils/get-global-override";
import waitForBundledExtensionsToBeLoadedInjectable from "../../../../features/extensions/loader/main/wait-for-bundled-loaded.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./wait-until-bundled-extensions-are-loaded.injectable";

export default getGlobalOverride(waitUntilBundledExtensionsAreLoadedInjectable, (di) => di.inject(waitForBundledExtensionsToBeLoadedInjectable));
