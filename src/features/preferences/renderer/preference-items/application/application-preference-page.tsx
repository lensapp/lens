/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferenceItemComponent } from "../preference-item-injection-token";

export const ApplicationPreferencePage: PreferenceItemComponent = ({ children }) => (
  <section id="application" data-preference-page-test="application">
    <h2 data-testid="application-header">Application</h2>

    {children}
  </section>
);
