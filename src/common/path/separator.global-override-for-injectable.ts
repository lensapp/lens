/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getGlobalOverride } from "../test-utils/get-global-override";
import fileSystemSeparatorInjectable from "./separator.injectable";

export default getGlobalOverride(fileSystemSeparatorInjectable, () => path.posix.sep);
