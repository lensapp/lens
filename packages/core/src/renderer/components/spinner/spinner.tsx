/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./spinner.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";

export interface SpinnerProps extends React.HTMLProps<HTMLDivElement> {
  singleColor?: boolean;
  center?: boolean;
}

export const Spinner = (props: SpinnerProps) => {
  const {
    singleColor = true,
    center = false,
    className,
    ...divProps
  } = props;
  const classNames = cssNames("Spinner", className, { singleColor, center });

  return <div {...divProps} className={classNames} />;
};
