/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "@k8slens/icon";


export const NoPrometheusProviderDetected = () => (
  <section>
    <SubTitle title="Auto detected prometheus details" />
    <div className="flex gaps align-center">
      <Icon material="error_outline" />
      <div>Could not detect any Prometheus provider.</div>
    </div>
  </section>
);
