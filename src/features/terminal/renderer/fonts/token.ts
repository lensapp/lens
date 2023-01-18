/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export interface TerminalFont {
  name: string;
  url: string;
}

export const terminalFontInjectionToken = getInjectionToken<TerminalFont>({
  id: "terminal-font-token",
});
