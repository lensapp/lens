/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

// This is here so that in tests we can override it to disable a warning because we are using jest-canvas-mock

const allowTerminalTransparencyInjectable = getInjectable({
  id: "allow-terminal-transparency",
  instantiate: () => false,
});

export default allowTerminalTransparencyInjectable;
