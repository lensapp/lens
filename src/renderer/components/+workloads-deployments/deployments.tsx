import "./deployments.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Deployment, deploymentApi } from "../../api/endpoints";
import { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
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
import { IDeploymentsRouteParams } from "../+workloads";
import { cssNames } from "../../utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { Notifications } from "../notifications";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

interface Props extends RouteComponentProps<IDeploymentsRouteParams> {
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
          [columnId.name]: (deployment: Deployment) => deployment.getName(),
          [columnId.namespace]: (deployment: Deployment) => deployment.getNs(),
          [columnId.replicas]: (deployment: Deployment) => deployment.getReplicas(),
          [columnId.age]: (deployment: Deployment) => deployment.getTimeDiffFromNow(),
          [columnId.condition]: (deployment: Deployment) => deployment.getConditionsText(),
        }}
        searchFilters={[
          (deployment: Deployment) => deployment.getSearchFields(),
          (deployment: Deployment) => deployment.getConditionsText(),
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
        renderTableContents={(deployment: Deployment) => [
          deployment.getName(),
          <KubeObjectStatusIcon key="icon" object={deployment}/>,
          deployment.getNs(),
          this.renderPods(deployment),
          deployment.getReplicas(),
          deployment.getAge(),
          this.renderConditions(deployment),
        ]}
        renderItemMenu={(item: Deployment) => {
          return <DeploymentMenu object={item}/>;
        }}
      />
    );
  }
}

export function DeploymentMenu(props: KubeObjectMenuProps<Deployment>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
        <Icon material="open_with" title="Scale" interactive={toolbar}/>
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
        <Icon material="autorenew" title="Restart" interactive={toolbar}/>
        <span className="title">Restart</span>
      </MenuItem>
    </>
  );
}

kubeObjectMenuRegistry.add({
  kind: "Deployment",
  apiVersions: ["apps/v1"],
  components: {
    MenuItem: DeploymentMenu
  }
});
