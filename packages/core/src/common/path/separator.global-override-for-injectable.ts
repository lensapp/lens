/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getGlobalOverride } from "@k8slens/test-utils";
import fileSystemSeparatorInjectable from "./separator.injectable";

export default getGlobalOverride(fileSystemSeparatorInjectable, () => path.posix.sep);
