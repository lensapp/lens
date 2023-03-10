/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getGlobalOverride } from "@k8slens/test-utils";
import getDirnameOfPathInjectable from "./get-dirname.injectable";

export default getGlobalOverride(getDirnameOfPathInjectable, () => path.posix.dirname);
