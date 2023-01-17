/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TerminalFont } from "./token";

export type LoadTerminalFont = (font: TerminalFont) => Promise<void>;

const loadTerminalFontInjectable = getInjectable({
  id: "load-terminal-font",
  instantiate: (): LoadTerminalFont => async (font) => {
    const fontLoaded = document.fonts.check(`10px ${font.name}`);

    if (fontLoaded) {
      return;
    }

    const fontFace = new FontFace(font.name, `url(${font.url})`);

    document.fonts.add(fontFace);
    await fontFace.load();
  },
  causesSideEffects: true,
});

export default loadTerminalFontInjectable;
