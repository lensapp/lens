/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferenceItemComponent } from "../preference-item-injection-token";

export const TerminalPage: PreferenceItemComponent = ({ children }) => (
  <div>
    <h2 data-testid="terminal-header">Terminal</h2>

    {children}
  </div>
);
