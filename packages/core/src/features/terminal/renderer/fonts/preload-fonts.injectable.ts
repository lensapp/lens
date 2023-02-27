/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsFirstInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import terminalFontsInjectable from "./fonts.injectable";
import loadTerminalFontInjectable from "./load-font.injectable";

const preloadTerminalFontsInjectable = getInjectable({
  id: "preload-terminal-fonts",
  instantiate: (di) => ({
    run: async () => {
      const terminalFonts = di.inject(terminalFontsInjectable);
      const loadTerminalFont = di.inject(loadTerminalFontInjectable);

      await Promise.allSettled(terminalFonts.map(loadTerminalFont));
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default preloadTerminalFontsInjectable;
