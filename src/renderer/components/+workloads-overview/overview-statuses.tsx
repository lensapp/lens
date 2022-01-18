/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview-statuses.scss";

import React from "react";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import { workloadStores } from "../+workloads";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import type { KubeResource } from "../../../common/rbac";
import { ResourceNames } from "../../utils/rbac";
import { boundMethod } from "../../utils";
import { workloadURL } from "../../../common/routes";
import { isAllowedResource } from "../../../common/utils/allowed-resource";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";

const resources: KubeResource[] = [
  "pods",
  "deployments",
  "statefulsets",
  "daemonsets",
  "replicasets",
  "jobs",
  "cronjobs",
];

interface Dependencies {
  namespaceStore: NamespaceStore
}

@observer
class NonInjectedOverviewStatuses extends React.Component<Dependencies> {
  @boundMethod
  renderWorkload(resource: KubeResource): React.ReactElement {
    const store = workloadStores.get(resource);

    if (!store) {
      return null;
    }

    const items = store.getAllByNs(this.props.namespaceStore.contextNamespaces);

    return (
      <div className="workload" key={resource}>
        <div className="title">
          <Link to={workloadURL[resource]()}>{ResourceNames[resource]} ({items.length})</Link>
        </div>
        <OverviewWorkloadStatus status={store.getStatuses(items)} />
      </div>
    );
  }

  render() {
    const workloads = resources
      .filter(isAllowedResource)
      .map(this.renderWorkload);

    return (
      <div className="OverviewStatuses">
        <div className="workloads">
          {workloads}
        </div>
      </div>
    );
  }
}

export const OverviewStatuses = withInjectables<Dependencies>(
  NonInjectedOverviewStatuses,

  {
    getProps: (di) => ({
      namespaceStore: di.inject(namespaceStoreInjectable),
    }),
  },
);
