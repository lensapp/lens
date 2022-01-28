/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type { EntitySettingViewProps } from "../../../extensions/registries";
import { ClusterAccessibleNamespaces } from "./components/accessible-namespaces";

interface Dependencies {
  getClusterById: (id: string) => Cluster | null;
}

const NonInjectedClusterSettingsNamespaces = observer(({ getClusterById, entity }: Dependencies & EntitySettingViewProps) => {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterAccessibleNamespaces cluster={cluster} />
    </section>
  );
});

export const ClusterSettingsNamespaces = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedClusterSettingsNamespaces, {
  getProps: (di, props) => ({
    getClusterById: di.inject(getClusterByIdInjectable),
    ...props,
  }),
});
