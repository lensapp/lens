/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import { terminalShellEnvModifiers } from "./terminal-shell-env-modifiers";
 
const terminalShellEnvModifiersInjectable = getInjectable({
  instantiate: (di) =>
    terminalShellEnvModifiers({
      extensions: di.inject(mainExtensionsInjectable),
    }),
 
  lifecycle: lifecycleEnum.singleton,
});
 
export default terminalShellEnvModifiersInjectable;
