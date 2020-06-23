import "./pod-container-ports.scss"

import React from "react";
import { observer } from "mobx-react";
import { t } from "@lingui/macro";
import { Pod, IPodContainer } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { apiBase } from "../../api"
import { observable } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Spinner } from "../spinner"

interface Props {
  pod: Pod;
  container: IPodContainer;
}

@observer
export class PodContainerPorts extends React.Component<Props> {
  @observable waiting = false;

  async portForward(port: number) {
    const { pod } = this.props;
    this.waiting = true;
    try {
      await apiBase.post(`/pods/${pod.getNs()}/pod/${pod.getName()}/port-forward/${port}`, {})
    } catch(error) {
      Notifications.error(error);
    } finally {
      this.waiting = false;
    }
  }

  render() {
    const { container } = this.props;
    return (
      <div className={cssNames("PodContainerPorts", { waiting: this.waiting })}>
        {
          container.ports.map((port) => {
            const key = `${container.name}-port-${port.containerPort}-${port.protocol}`
            const text = (port.name ? port.name + ': ' : '')+`${port.containerPort}/${port.protocol}`
            return(
              <p key={key}>
                <span title={_i18n._(t`Open in a browser`)} onClick={() => this.portForward(port.containerPort) }>
                  {text}
                  {this.waiting && (
                    <Spinner />
                  )}
                </span>
              </p>
            );
          })}
      </div>
    );
  }
}
