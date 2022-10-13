/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferenceItemComponent } from "../preference-item-injection-token";

export const TelemetryPage: PreferenceItemComponent = ({ children }) => (
  <section id="telemetry">
    <h2 data-testid="telemetry-header">Telemetry</h2>

    {children}
  </section>
);
