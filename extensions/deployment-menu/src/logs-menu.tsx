import React from "react";
import { Component, K8sApi, Navigation} from "@k8slens/extensions";

export interface DeploymentLogsMenuProps extends Component.KubeObjectMenuProps<K8sApi.Deployment> {
}

export class DeploymentLogsMenu extends React.Component<DeploymentLogsMenuProps> {
  showLogs() {
    Navigation.hideDetails();
    const deployment = this.props.object;
    const deploymentStore : K8sApi.DeploymentStore = K8sApi.apiManager.getStore(K8sApi.deploymentApi);

    deploymentStore.getChildPods(deployment);

    Component.logTabStore.createPodTab({
      selectedPod: deploymentStore.getChildPods(deployment)[0],
      selectedContainer: deploymentStore.getChildPods(deployment)[0].getContainers()[0],
    });
  }

  render() {
    const { object: deployment, toolbar } = this.props;

    return (
      <Component.MenuItem onClick={() => this.showLogs()}>
        <Component.Icon material="subject" title="Logs" interactive={toolbar}/>
        <span className="title">Logs</span>
      </Component.MenuItem>
    );
  }
}
