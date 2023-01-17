/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import AnonymousPro from "./AnonymousPro-Regular.ttf";

const anonymousProTerminalFontInjectable = getInjectable({
  id: "anonymous-pro-terminal-font",
  instantiate: () => ({
    name:"Anonymous Pro",
    url: AnonymousPro,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default anonymousProTerminalFontInjectable;
