/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { PreferenceItemComponent } from "../preference-item-injection-token";

export const KubernetesPage: PreferenceItemComponent = ({ children }) => (
  <section id="kubernetes" data-preference-page-test="kubernetes">
    <h2 data-testid="kubernetes-header">Kubernetes</h2>

    {children}
  </section>
);
