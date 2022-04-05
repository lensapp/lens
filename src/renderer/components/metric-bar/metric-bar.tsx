/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./metric-bar.module.scss";

import React, { HTMLAttributes, ReactNode } from "react";
import { VerticalBar } from "../vertical-bar";
import { cssNames } from "../../utils";
import { uniqueId } from "lodash";
import { Tooltip, TooltipDecoratorProps } from "../tooltip";

interface BarProps extends HTMLAttributes<HTMLDivElement>, TooltipDecoratorProps {
  value: number;
  max: number;
  min?: number;
  height?: number;
  showPercent?: ReactNode;
  changeColorOnWarning?: boolean;
  warningPercentage?: number;
}

export const MetricBar = (props: BarProps) => {
  const {
    max,
    min = 0,
    showPercent = true,
    changeColorOnWarning = true,
    warningPercentage = 85,
    value,
    height,
    tooltip,
  } = props;
  const percents = Math.min(100, value / (max - min) * 100);
  const percentsRounded = +percents.toFixed(2);
  const warning = percents > warningPercentage;
  const id = props.id || uniqueId("tooltip_target_");

  return (
    <div className={cssNames(styles.metricBar, props.className)} data-testid="metric-bar" id={id}>
      <VerticalBar
        value={percentsRounded}
        className={cssNames(styles.bar, { [styles.warning]: warning && changeColorOnWarning })}
        style={{ blockSize: height }}
      />
      {showPercent && <span>{percentsRounded}%</span>}
      <Tooltip targetId={id} {...tooltip}/>
    </div>
  );
};
