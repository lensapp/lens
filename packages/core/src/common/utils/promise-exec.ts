/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as util from "util";
import { execFile } from "child_process";

export const promiseExecFile = util.promisify(execFile);
