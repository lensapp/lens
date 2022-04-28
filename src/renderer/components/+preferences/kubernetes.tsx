/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";

import { HelmCharts } from "./helm-charts";
import { KubeconfigSyncs } from "./kubeconfig-syncs/view";
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
      <section id="kube-sync">
        <h2 data-testid="kubernetes-sync-header">Kubeconfig Syncs</h2>
        <KubeconfigSyncs />
      </section>
      <hr />
      <section id="helm">
        <h2>Helm Charts</h2>
        <HelmCharts />
      </section>
    </section>
  </Preferences>
));
