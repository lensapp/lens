/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import openLinkInBrowserInjectable from "./open-link-in-browser.injectable";

export default getGlobalOverride(openLinkInBrowserInjectable, () => async () => {});
