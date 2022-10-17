/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferencePageComponent } from "./preference-items/preference-item-injection-token";

export const getPreferencePage = (label: string): PreferencePageComponent => ({ children, item }) => (
  <section id={item.id} data-preference-page-test={item.id}>
    <h2>{label}</h2>

    {children}
  </section>
);
