/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type {
  PreferenceItemComponent,
  PreferencePage,
} from "./preference-items/preference-item-injection-token";

export const getPreferencePage = (label: string): PreferenceItemComponent<PreferencePage> => ({ children, item }) => (
  <section id={item.id} data-preference-page-test={item.id}>
    <h2 data-preference-page-title-test={true}>{label}</h2>

    {children}
  </section>
);
