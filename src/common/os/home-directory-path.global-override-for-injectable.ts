/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../test-utils/get-global-override";
import homeDirectoryPathInjectable from "./home-directory-path.injectable";

export default getGlobalOverride(homeDirectoryPathInjectable, () => "/some-home-directory");
