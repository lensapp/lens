/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./status-brick.scss";

import React from "react";
import { cssNames } from "../../utils";
import { withTooltip } from "../tooltip";

export interface StatusBrickProps extends React.HTMLAttributes<any> {
}

export const StatusBrick = withTooltip(({ className, ...elemProps }: StatusBrickProps) => (
  <div
    className={cssNames("StatusBrick", className)}
    {...elemProps} />
));
