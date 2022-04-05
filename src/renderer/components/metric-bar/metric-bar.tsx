/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./metric-bar.module.scss";

import React, { HTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import { cssNames, cssVar } from "../../utils";
import { VerticalBar } from "../vertical-bar";

interface BarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  min?: number;
  tooltip?: ReactNode;
  showPercent?: ReactNode;
  changeColorOnWarning?: boolean;
  warningPercentage?: number;
  metricName?: "cpu" | "memory" | "disk";  // Used for color setting
  customColor?: string;
}

export function MetricBar(props: BarProps) {
  const elem = useRef<HTMLDivElement>();
  const { max, min, tooltip, showPercent, changeColorOnWarning = true, warningPercentage = 85, value, metricName, customColor } = props;
  const percents = Math.min(100, value / (max - min) * 100);
  const [metricColor, setMetricColor] = useState("var(--colorVague)");
  const color = (percents > warningPercentage && changeColorOnWarning) ? "pink" : customColor || metricColor;

  useEffect(() => {
    const cssVars = cssVar(elem.current);

    setMetricColor(cssVars.get(`--color-${metricName}`).toString());
  });

  return (
    <div className={cssNames(styles.metricBar)} data-testid="metric-bar" ref={elem}>
      <VerticalBar color={color} value={percents} />
      {showPercent && <label>{percents}%</label>}
    </div>
  );
}
