/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import mainExtensionsInjectable from "../../../extensions/main-extensions.injectable";
import { isDefined } from "../../../common/utils";

const terminalShellEnvModifiersInjectable = getInjectable({
  id: "terminal-shell-env-modifiers",
  instantiate: (di) => {
    const extensions = di.inject(mainExtensionsInjectable);

    return computed(() => (
      extensions.get()
        .map((extension) => extension.terminalShellEnvModifier)
        .filter(isDefined)
    ));
  },
});

export default terminalShellEnvModifiersInjectable;
