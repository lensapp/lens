/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./deployments.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { Deployment, deploymentApi } from "../../api/endpoints";
import type { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { DeploymentScaleDialog } from "./deployment-scale-dialog";
import { ConfirmDialog } from "../confirm-dialog";
import { deploymentStore } from "./deployments.store";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object";
import { cssNames } from "../../utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Notifications } from "../notifications";
import type { DeploymentsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

interface Props extends RouteComponentProps<DeploymentsRouteParams> {
}

@observer
export class Deployments extends React.Component<Props> {
  renderPods(deployment: Deployment) {
    const { replicas, availableReplicas } = deployment.status;

    return `${availableReplicas || 0}/${replicas || 0}`;
  }

  renderConditions(deployment: Deployment) {
    const conditions = orderBy(deployment.getConditions(true), "type", "asc");

    return conditions.map(({ type, message }) => (
      <span key={type} className={cssNames("condition", kebabCase(type))} title={message}>
        {type}
      </span>
    ));
  }

  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_deployments"
        className="Deployments" store={deploymentStore}
        dependentStores={[replicaSetStore, podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [columnId.name]: deployment => deployment.getName(),
          [columnId.namespace]: deployment => deployment.getNs(),
          [columnId.replicas]: deployment => deployment.getReplicas(),
          [columnId.age]: deployment => deployment.getTimeDiffFromNow(),
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
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Pods", className: "pods", id: columnId.pods },
          { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Conditions", className: "conditions", sortBy: columnId.condition, id: columnId.condition },
        ]}
        renderTableContents={deployment => [
          deployment.getName(),
          <KubeObjectStatusIcon key="icon" object={deployment}/>,
          deployment.getNs(),
          this.renderPods(deployment),
          deployment.getReplicas(),
          deployment.getAge(),
          this.renderConditions(deployment),
        ]}
        renderItemMenu={item => <DeploymentMenu object={item} />}
      />
    );
  }
}

export function DeploymentMenu(props: KubeObjectMenuProps<Deployment>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
        <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
        <span className="title">Scale</span>
      </MenuItem>
      <MenuItem onClick={() => ConfirmDialog.open({
        ok: async () =>
        {
          try {
            await deploymentApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            Notifications.error(err);
          }
        },
        labelOk: `Restart`,
        message: (
          <p>
            Are you sure you want to restart deployment <b>{object.getName()}</b>?
          </p>
        ),
      })}>
        <Icon material="autorenew" tooltip="Restart" interactive={toolbar}/>
        <span className="title">Restart</span>
      </MenuItem>
    </>
  );
}
