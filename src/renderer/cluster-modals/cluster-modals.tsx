/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./cluster-modals.module.css";

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { ClusterModalRegistration } from "../../extensions/registries";
import clusterModalsInjectable from "./cluster-modals.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  clusterModals: ClusterModalRegistration[];
}

export const NonInjectedClusterModals = observer(({ clusterModals }: Dependencies) => {
  return (
    <div className={styles.clusterModals} style={{ height: 0 }}>
      {clusterModals.map((modal) => {
        return modal.visible.get() ? <modal.Component key={modal.id} /> : null;
      })}
    </div>
  );
});

export const ClusterModals = withInjectables<Dependencies>(NonInjectedClusterModals, {
  getProps: (di, props) => ({
    ...props,
    clusterModals: di.inject(clusterModalsInjectable),
  }),
});
