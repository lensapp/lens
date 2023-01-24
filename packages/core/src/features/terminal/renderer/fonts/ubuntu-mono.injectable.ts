/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import UbuntuMono from "./UbuntuMono-Regular.ttf";

const ubunutuMonoTerminalFontInjectable = getInjectable({
  id: "ubunutu-mono-terminal-font",
  instantiate: () => ({
    name: "Ubuntu Mono",
    url: UbuntuMono,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default ubunutuMonoTerminalFontInjectable;
