/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";
import IBMPlexMono from "./IBMPlexMono-Regular.ttf";

const ibmPlexMonoTerminalFontInjectable = getInjectable({
  id: "ibm-plex-mono-terminal-font",
  instantiate: () => ({
    name: "IBM Plex Mono",
    url: IBMPlexMono,
  }),
  injectionToken: terminalFontInjectionToken,
});

export default ibmPlexMonoTerminalFontInjectable;
