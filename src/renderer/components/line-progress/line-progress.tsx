/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./line-progress.scss";
import React from "react";
import { cssNames } from "../../utils";
import type { TooltipDecoratorProps } from "../tooltip";
import { withTooltip } from "../tooltip";

export interface LineProgressProps extends React.HTMLProps<any>, TooltipDecoratorProps {
  value: number;
  min?: number;
  max?: number;
  className?: any;
  precise?: number;
}

export const LineProgress = withTooltip(({
  className,
  min = 0,
  max = 100,
  value,
  precise = 2,
  children,
  ...props
}: LineProgressProps) => {
  const valuePercents = Math.min(100, value / (max - min) * 100).toFixed(precise);

  return (
    <div className={cssNames("LineProgress", className)} {...props}>
      <div className="line" style={{ width: `${valuePercents}%` }}></div>
      {children}
    </div>
  );
});
