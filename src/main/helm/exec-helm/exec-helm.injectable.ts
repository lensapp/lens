/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../helm-binary-path.injectable";

const execHelmInjectable = getInjectable({
  id: "exec-helm",

  instantiate: (di) => {
    const execFile = di.inject(execFileInjectable);
    const helmBinaryPath = di.inject(helmBinaryPathInjectable);

    return (...args: string[]) => execFile(helmBinaryPath, args);
  },
});

export default execHelmInjectable;
