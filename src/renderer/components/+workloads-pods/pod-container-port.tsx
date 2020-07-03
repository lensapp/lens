import "./pod-container-port.scss"

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
  containerName: string;
  port: {
    name?: string;
    containerPort: number;
    protocol: string;
  }
}

@observer
export class PodContainerPort extends React.Component<Props> {
  @observable waiting = false;

  async portForward() {
    const { pod, port } = this.props;
    this.waiting = true;
    try {
      await apiBase.post(`/pods/${pod.getNs()}/pod/${pod.getName()}/port-forward/${port.containerPort}`, {})
    } catch(error) {
      Notifications.error(error);
    } finally {
      this.waiting = false;
    }
  }

  render() {
    const { containerName, port } = this.props;
    const { name, containerPort, protocol } = port;
    const key = `${containerName}-port-${containerPort}-${protocol}`
    const text = (name ? name + ': ' : '')+`${containerPort}/${protocol}`
    return (
      <p className={cssNames("PodContainerPort", { waiting: this.waiting })} key={key}>
        <span title={_i18n._(t`Open in a browser`)} onClick={() => this.portForward() }>
          {text}
          {this.waiting && (
            <Spinner />
          )}
        </span>
      </p>
    )
  }
}
