/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import SpaceMono from "./SpaceMono-Regular.ttf";

const spaceMonoTerminalFontInjectable = getInjectable({
  id: "space-mono-terminal-font",
  instantiate: () => ({
    name: "Space Mono",
    url: SpaceMono,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default spaceMonoTerminalFontInjectable;
