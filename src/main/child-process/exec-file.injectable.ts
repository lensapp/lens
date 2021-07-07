/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { execFile } from "child_process";
import { promisify } from "util";

export type ExecFile = typeof execFile["__promisify__"];

const execFileInjectable = getInjectable({
  id: "exec-file",
  instantiate: (): ExecFile => promisify(execFile),
});

export default execFileInjectable;
