/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import React from "react";

import { HelmRepositories } from "./helm-repositories";
import { ActivationOfPublicHelmRepository } from "./activation-of-public-helm-repository/activation-of-public-helm-repository";

export const HelmCharts = () => (
  <div>
    <div className="flex gaps">
      <ActivationOfPublicHelmRepository />
    </div>

    <HelmRepositories />
  </div>
);

