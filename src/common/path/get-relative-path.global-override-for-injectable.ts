/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getGlobalOverride } from "../test-utils/get-global-override";
import getRelativePathInjectable from "./get-relative-path.injectable";

export default getGlobalOverride(getRelativePathInjectable, () => path.posix.relative);
