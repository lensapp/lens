/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../../common/test-utils/get-global-override";
import { preloadAllTerminalFontsInjectable } from "./terminal-fonts.injectable";

export default getGlobalOverride(preloadAllTerminalFontsInjectable, () => {
  return {
    id: "",
    async run() {
    },
  };
});
