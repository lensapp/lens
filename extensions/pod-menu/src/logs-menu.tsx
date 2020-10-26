import React from "react";
import { Component, K8sApi, Util, Navigation } from "@k8slens/extensions";

interface Props extends Component.KubeObjectMenuProps<K8sApi.Pod> {
}

export class PodLogsMenu extends React.Component<Props> {
  showLogs(container: K8sApi.IPodContainer) {
    Navigation.hideDetails();
    const pod = this.props.object;
    Component.createPodLogsTab({
      pod,
      containers: pod.getContainers(),
      initContainers: pod.getInitContainers(),
      selectedContainer: container,
      showTimestamps: false,
      previous: false,
      tailLines: 1000
    });
  }

  render() {
    const { object: pod, toolbar } = this.props
    const containers = pod.getAllContainers();
    const statuses = pod.getContainerStatuses();
    if (!containers.length) return;
    return (
      <Component.MenuItem onClick={Util.prevDefault(() => this.showLogs(containers[0]))}>
        <Component.Icon material="subject" title="Logs" interactive={toolbar}/>
        <span className="title">Logs</span>
        {containers.length > 1 && (
          <>
            <Component.Icon className="arrow" material="keyboard_arrow_right"/>
            <Component.SubMenu>
              {
                containers.map(container => {
                  const { name } = container
                  const status = statuses.find(status => status.name === name);
                  const brick = status ? (
                    <Component.StatusBrick
                      className={Util.cssNames(Object.keys(status.state)[0], { ready: status.ready })}
                    />
                  ) : null
                  return (
                    <Component.MenuItem key={name} onClick={Util.prevDefault(() => this.showLogs(container))} className="flex align-center">
                      {brick}
                      {name}
                    </Component.MenuItem>
                  )
                })
              }
            </Component.SubMenu>
          </>
        )}
      </Component.MenuItem>
    )
  }
}
