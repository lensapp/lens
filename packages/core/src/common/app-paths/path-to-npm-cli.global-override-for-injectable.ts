/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import pathToNpmCliInjectable from "./path-to-npm-cli.injectable";

export default getGlobalOverride(pathToNpmCliInjectable, () => "/some/npm/cli/path");
