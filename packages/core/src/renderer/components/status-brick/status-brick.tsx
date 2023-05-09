/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./status-brick.scss";

import React from "react";
import type { SafeReactNode, SingleOrMany } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { withTooltip } from "@k8slens/tooltip";

export interface StatusBrickProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: SingleOrMany<SafeReactNode>;
}

export const StatusBrick = withTooltip(({ className, ...elemProps }: StatusBrickProps) => (
  <div
    className={cssNames("StatusBrick", className)}
    {...elemProps}
  />
));
