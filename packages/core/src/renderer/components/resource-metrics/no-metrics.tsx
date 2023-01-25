/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "../icon";

export function NoMetrics() {
  return (
    <div className="flex justify-center align-center">
      <Icon material="info"/>
&nbsp;Metrics not available at the moment
    </div>
  );
}
