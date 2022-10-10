import styles from "./cluster-modals.module.css";

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { ClusterModalRegistration } from "../../extensions/registries";
import clusterModalsInjectable from "./cluster-modals.injectable";

interface Dependencies {
  clusterModals: ClusterModalRegistration[];
}

export const NonInjectedClusterModals = ({ clusterModals }: Dependencies) => {
  return (
    <div className={styles.clusterModals}>
      {clusterModals.map((modal) => {
        return modal.visible ? <modal.Component key={modal.id} /> : null;
      })}
    </div>
  );
}

export const ClusterModals = withInjectables<Dependencies>(NonInjectedClusterModals, {
  getProps: (di, props) => ({
    ...props,
    clusterModals: di.inject(clusterModalsInjectable),
  }),
});