/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../layout/sub-title";

interface PrometheusDetailsProps  {
  providerName: string;
  path: string;
}
export const PrometheusDetails = ({ providerName, path }: PrometheusDetailsProps) => (
  <section data-testid="auto-detected-prometheus-details">
    <SubTitle title="Auto detected Prometheus details" />
    <div className="flex gaps" data-testid="auto-detected-prometheus-details-provider">
      <div>
        Provider:
      </div>
      <div>
        {providerName}
      </div>
    </div>
    <div className="flex gaps" data-testid="auto-detected-prometheus-details-path">
      <div>
        Path:
      </div>
      <div>
        {path}
      </div>
    </div>
  </section>
);
