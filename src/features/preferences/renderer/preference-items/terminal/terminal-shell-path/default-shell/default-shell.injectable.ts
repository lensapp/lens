/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isWindowsInjectable from "../../../../../../../common/vars/is-windows.injectable";

const defaultShellInjectable = getInjectable({
  id: "default-shell",

  instantiate: (di) => {
    const isWindows = di.inject(isWindowsInjectable);

    return (
      process.env.SHELL ||
      process.env.PTYSHELL ||
      (isWindows ? "powershell.exe" : "System default shell")
    );
  },

  causesSideEffects: true,
});

export default defaultShellInjectable;
