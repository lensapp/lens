/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getGlobalOverride } from "../test-utils/get-global-override";
import pathDelimiterInjectable from "./delimiter.injectable";

export default getGlobalOverride(pathDelimiterInjectable, () => path.posix.delimiter);
