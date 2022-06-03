/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import React from "react";

import { HelmRepositories } from "./helm-repositories";

export const HelmCharts = () => (
  <div>
    <div className="flex gaps">
      <HelmRepositories />
    </div>
  </div>
);

