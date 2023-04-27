/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployments.scss";

import React from "react";
import { observer } from "mobx-react";
import type { Deployment } from "@k8slens/kube-object";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { cssNames } from "@k8slens/utilities";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { DeploymentStore } from "./store";
import type { EventStore } from "../events/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import deploymentStoreInjectable from "./store.injectable";
import eventStoreInjectable from "../events/store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

interface Dependencies {
  deploymentStore: DeploymentStore;
  eventStore: EventStore;
}

@observer
class NonInjectedDeployments extends React.Component<Dependencies> {
  renderPods(deployment: Deployment) {
    const { replicas, availableReplicas } = deployment.status ?? {};

    return `${availableReplicas || 0}/${replicas || 0}`;
  }

  renderConditions(deployment: Deployment) {
    const conditions = orderBy(deployment.getConditions(true), "type", "asc");

    return conditions.map(({ type, message }) => (
      <span
        key={type}
        className={cssNames("condition", kebabCase(type))}
        title={message}
      >
        {type}
      </span>
    ));
  }

  render() {
    const {
      deploymentStore,
      eventStore,
    } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="workload_deployments"
          className="Deployments"
          store={deploymentStore}
          dependentStores={[eventStore]} // status icon component uses event store
          sortingCallbacks={{
            [columnId.name]: deployment => deployment.getName(),
            [columnId.namespace]: deployment => deployment.getNs(),
            [columnId.replicas]: deployment => deployment.getReplicas(),
            [columnId.age]: deployment => -deployment.getCreationTimestamp(),
            [columnId.condition]: deployment => deployment.getConditionsText(),
          }}
          searchFilters={[
            deployment => deployment.getSearchFields(),
            deployment => deployment.getConditionsText(),
          ]}
          renderHeaderTitle="Deployments"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { className: "warning", showWithColumn: columnId.name },
            {
              title: "Namespace",
              className: "namespace",
              sortBy: columnId.namespace,
              id: columnId.namespace,
            },
            { title: "Pods", className: "pods", id: columnId.pods },
            {
              title: "Replicas",
              className: "replicas",
              sortBy: columnId.replicas,
              id: columnId.replicas,
            },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
            {
              title: "Conditions",
              className: "conditions",
              sortBy: columnId.condition,
              id: columnId.condition,
            },
          ]}
          renderTableContents={deployment => [
            deployment.getName(),
            <KubeObjectStatusIcon key="icon" object={deployment} />,
            <NamespaceSelectBadge
              key="namespace"
              namespace={deployment.getNs()}
            />,
            this.renderPods(deployment),
            deployment.getReplicas(),
            <KubeObjectAge key="age" object={deployment} />,
            this.renderConditions(deployment),
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const Deployments = withInjectables<Dependencies>(NonInjectedDeployments, {
  getProps: (di, props) => ({
    ...props,
    deploymentStore: di.inject(deploymentStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
  }),
});
