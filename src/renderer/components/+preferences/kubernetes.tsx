/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import { HelmCharts } from "../../../features/helm-charts/child-features/preferences/renderer/helm-charts";
import { KubeconfigSync } from "../../../features/preferences/renderer/preference-items/kubernetes/kubeconfig-sync/kubeconfig-sync";
import { KubectlBinaries } from "./kubectl-binaries";
import { Preferences } from "./preferences";

export const Kubernetes = observer(() => (
  <Preferences data-testid="kubernetes-preferences-page">
    <section id="kubernetes">
      <section id="kubectl">
        <h2 data-testid="kubernetes-header">Kubernetes</h2>
        <KubectlBinaries />
      </section>
      <hr />
      <KubeconfigSync />
      <hr />
      <HelmCharts />
    </section>
  </Preferences>
));
