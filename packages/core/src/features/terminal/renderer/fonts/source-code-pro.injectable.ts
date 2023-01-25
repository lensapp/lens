/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import SourceCodePro from "./SourceCodePro-Regular.ttf";

const sourceCodeProTerminalFontInjectable = getInjectable({
  id: "source-code-pro-terminal-font",
  instantiate: () => ({
    name: "Source Code Pro",
    url: SourceCodePro,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default sourceCodeProTerminalFontInjectable;
