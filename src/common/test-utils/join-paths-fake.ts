/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { join } from "lodash/fp";
import type { JoinPaths } from "../path/join-paths.injectable";

export const joinPathsFake: JoinPaths = join("/");
