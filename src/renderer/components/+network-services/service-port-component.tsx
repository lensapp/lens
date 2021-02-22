import "./service-port-component.scss";

import React from "react";
import { observer } from "mobx-react";
import { Service, ServicePort } from "../../api/endpoints";
import { apiBase } from "../../api";
import { observable } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Spinner } from "../spinner";

interface Props {
  service: Service;
  port: ServicePort;
}

@observer
export class ServicePortComponent extends React.Component<Props> {
  @observable waiting = false;

  async portForward() {
    const { service, port } = this.props;

    this.waiting = true;

    try {
      await apiBase.post(`/pods/${service.getNs()}/service/${service.getName()}/port-forward/${port.port}`, {});
    } catch(error) {
      Notifications.error(error);
    } finally {
      this.waiting = false;
    }
  }

  render() {
    const { port } = this.props;

    return (
      <div className={cssNames("ServicePortComponent", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward() }>
          {port.toString()}
          {this.waiting && (
            <Spinner />
          )}
        </span>
      </div>
    );
  }
}
