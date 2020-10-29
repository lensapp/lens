import "./deployments.scss"

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
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
import { _i18n } from "../../i18n";
import { cssNames } from "../../utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";
import { apiManager } from "../../api/api-manager";
import { Notifications } from "../notifications";

enum sortBy {
  name = "name",
  namespace = "namespace",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

interface Props extends RouteComponentProps<IDeploymentsRouteParams> {
}

@observer
export class Deployments extends React.Component<Props> {
  renderPods(deployment: Deployment) {
    const { replicas, availableReplicas } = deployment.status
    return `${availableReplicas || 0}/${replicas || 0}`
  }

  renderConditions(deployment: Deployment) {
    const conditions = orderBy(deployment.getConditions(true), "type", "asc")
    return conditions.map(({ type, message }) => (
      <span key={type} className={cssNames("condition", kebabCase(type))} title={message}>
        {type}
      </span>
    ))
  }

  render() {
    return (
      <KubeObjectListLayout
        className="Deployments" store={deploymentStore}
        dependentStores={[replicaSetStore, podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (deployment: Deployment) => deployment.getName(),
          [sortBy.namespace]: (deployment: Deployment) => deployment.getNs(),
          [sortBy.replicas]: (deployment: Deployment) => deployment.getReplicas(),
          [sortBy.age]: (deployment: Deployment) => deployment.metadata.creationTimestamp,
          [sortBy.condition]: (deployment: Deployment) => deployment.getConditionsText(),
        }}
        searchFilters={[
          (deployment: Deployment) => deployment.getSearchFields(),
          (deployment: Deployment) => deployment.getConditionsText(),
        ]}
        renderHeaderTitle={<Trans>Deployments</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Pods</Trans>, className: "pods" },
          { title: <Trans>Replicas</Trans>, className: "replicas", sortBy: sortBy.replicas },
          { className: "warning" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Conditions</Trans>, className: "conditions", sortBy: sortBy.condition },
        ]}
        renderTableContents={(deployment: Deployment) => [
          deployment.getName(),
          deployment.getNs(),
          this.renderPods(deployment),
          deployment.getReplicas(),
          <KubeEventIcon object={deployment}/>,
          deployment.getAge(),
          this.renderConditions(deployment),
        ]}
        renderItemMenu={(item: Deployment) => {
          return <DeploymentMenu object={item}/>
        }}
      />
    )
  }
}

export function DeploymentMenu(props: KubeObjectMenuProps<Deployment>) {
  const { object, toolbar } = props;
  return (
    <>
      <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
        <Icon material="open_with" title={_i18n._(t`Scale`)} interactive={toolbar}/>
        <span className="title"><Trans>Scale</Trans></span>
      </MenuItem>
      <MenuItem onClick={() => ConfirmDialog.open({
        ok: async () =>
        {
          try {
            await deploymentApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            })
          } catch (err) {
            Notifications.error(err);
          }
        },
        labelOk: _i18n._(t`Restart`),
        message: (
          <p>
            <Trans>Are you sure you want to restart deployment <b>{object.getName()}</b>?</Trans>
          </p>
        ),
      })}>
        <Icon material="autorenew" title={_i18n._(t`Restart`)} interactive={toolbar}/>
        <span className="title"><Trans>Restart</Trans></span>
      </MenuItem>
    </>
  )
}

kubeObjectMenuRegistry.add({
  kind: "Deployment",
  apiVersions: ["apps/v1"],
  components: {
    MenuItem: DeploymentMenu
  }
})
