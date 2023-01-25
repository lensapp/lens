/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import RobotoMono from "./Roboto-Mono.ttf"; // patched font with icons

const robotoMonoTerminalFontInjectable = getInjectable({
  id: "roboto-mono-terminal-font",
  instantiate: () => ({
    name: "RobotoMono",
    url: RobotoMono,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default robotoMonoTerminalFontInjectable;
