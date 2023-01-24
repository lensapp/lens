/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import JetBrainsMono from "./JetBrainsMono-Regular.ttf";

const jetbrainsMonoTerminalFontInjectable = getInjectable({
  id: "jetbrains-mono-terminal-font",
  instantiate: () => ({
    name: "JetBrains Mono",
    url: JetBrainsMono,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default jetbrainsMonoTerminalFontInjectable;
