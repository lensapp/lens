/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsFirstInjectionToken } from "../../../before-frame-starts/tokens";
import RobotoMono from "../../../fonts/Roboto-Mono-nerd.ttf"; // patched font with icons
import AnonymousPro from "../../../fonts/AnonymousPro-Regular.ttf";
import IBMPlexMono from "../../../fonts/IBMPlexMono-Regular.ttf";
import JetBrainsMono from "../../../fonts/JetBrainsMono-Regular.ttf";
import RedHatMono from "../../../fonts/RedHatMono-Regular.ttf";
import SourceCodePro from "../../../fonts/SourceCodePro-Regular.ttf";
import SpaceMono from "../../../fonts/SpaceMono-Regular.ttf";
import UbuntuMono from "../../../fonts/UbuntuMono-Regular.ttf";

export const terminalFontsInjectable = getInjectable({
  id: "terminalFontsInjectable",

  instantiate() {
    return new Map([
      ["RobotoMono", RobotoMono],
      ["Anonymous Pro", AnonymousPro],
      ["IBM Plex Mono", IBMPlexMono],
      ["JetBrains Mono", JetBrainsMono],
      ["Red Hat Mono", RedHatMono],
      ["Source Code Pro", SourceCodePro],
      ["Space Mono", SpaceMono],
      ["Ubuntu Mono", UbuntuMono],
    ]);
  },
});


export const preloadTerminalFontInjectable = getInjectable({
  id: "preloadTerminalFontInjectable",

  instantiate(di) {
    const terminalFonts = di.inject(terminalFontsInjectable);

    return async function (fontFamily: string): Promise<void> {
      const fontBundledPath = terminalFonts.get(fontFamily);
      const fontLoaded = document.fonts.check(`10px ${fontFamily}`);

      if (fontLoaded || !fontBundledPath) return;

      const font = new FontFace(fontFamily, `url(${fontBundledPath})`);

      document.fonts.add(font);
      await font.load();
    };
  },

  causesSideEffects: true,
});

export const preloadAllTerminalFontsInjectable = getInjectable({
  id: "preloadAllTerminalFontsInjectable",

  instantiate(di) {
    const terminalFonts = di.inject(terminalFontsInjectable);
    const preloadFont = di.inject(preloadTerminalFontInjectable);

    return {
      id: "preload-all-terminal-fonts",

      async run() {
        await Promise.allSettled(
          Array.from(terminalFonts.keys()).map(preloadFont),
        );
      },
    };
  },

  injectionToken: beforeFrameStartsFirstInjectionToken,

  causesSideEffects: true,
});
