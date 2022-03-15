/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import { terminalShellEnvModify } from "./terminal-shell-env-modifiers";

const terminalShellEnvModifyInjectable = getInjectable({
  id: "terminal-shell-env-modify",

  instantiate: (di) =>
    terminalShellEnvModify({
      extensions: di.inject(mainExtensionsInjectable),
    }),
});

export default terminalShellEnvModifyInjectable;
