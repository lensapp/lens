/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { terminalFontInjectionToken } from "./token";

const terminalFontsInjectable = getInjectable({
  id: "terminal-fonts",
  instantiate: (di) => di.injectMany(terminalFontInjectionToken),
});

export default terminalFontsInjectable;
