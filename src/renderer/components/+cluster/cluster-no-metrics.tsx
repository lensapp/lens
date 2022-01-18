/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "../icon";
import { cssNames } from "../../utils";

interface Props {
  className: string;
}

export function ClusterNoMetrics({ className }: Props) {
  return (
    <div className={cssNames("ClusterNoMetrics flex column box grow justify-center align-center", className)}>
      <Icon material="info"/>
      <p>Metrics are not available due to missing or invalid Prometheus configuration.</p>
      <p>Right click cluster icon to open cluster settings.</p>
    </div>
  );
}
