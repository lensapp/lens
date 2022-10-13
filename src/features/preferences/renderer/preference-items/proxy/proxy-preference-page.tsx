/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferenceItemComponent } from "../preference-item-injection-token";

export const ProxyPreferencePage: PreferenceItemComponent = ({ children }) => (
  <section id="proxy">
    <h2 data-testid="proxy-header">Proxy</h2>

    {children}
  </section>
);
