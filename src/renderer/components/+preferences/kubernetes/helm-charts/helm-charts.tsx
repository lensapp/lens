/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import React from "react";

import { HelmRepositories } from "./helm-repositories";
import { ActivationOfPublicHelmRepository } from "./activation-of-public-helm-repository/activation-of-public-helm-repository";
import { ActivationOfCustomHelmRepositoryOpenButton } from "./activation-of-custom-helm-repository/activation-of-custom-helm-repository-open-button";
import { ActivationOfCustomHelmRepositoryDialog } from "./activation-of-custom-helm-repository/activation-of-custom-helm-repository-dialog";

export const HelmCharts = () => (
  <div>
    <div className="flex gaps">
      <ActivationOfPublicHelmRepository />

      <ActivationOfCustomHelmRepositoryOpenButton />
    </div>

    <HelmRepositories />

    <ActivationOfCustomHelmRepositoryDialog />
  </div>
);

