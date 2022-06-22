/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import HelmLogoPlaceholder from "./helm-placeholder.svg";

export interface HelmChartIconProps {
  className?: string;
  chart: HelmChart;
}

export const HelmChartIcon = ({
  chart,
  className,
}: HelmChartIconProps) => {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const icon = chart.getIcon();

  if (!icon || failedToLoad) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{
          __html: HelmLogoPlaceholder,
        }}
      />
    );
  }

  return (
    <img
      className={className}
      src={icon}
      onLoad={evt => evt.currentTarget.classList.add("visible")}
      onError={() => setFailedToLoad(true)}
    />
  );
};
