import "./service-ports.scss"

import React from "react";
import { observer } from "mobx-react";
import { t } from "@lingui/macro";
import { Service, ServicePort } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { apiBase } from "../../api"
import { observable } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Spinner } from "../spinner"

interface Props {
  service: Service;
}

@observer
export class ServicePorts extends React.Component<Props> {
  @observable waiting = false;

  async portForward(port: ServicePort) {
    const { service } = this.props;
    this.waiting = true;
    apiBase.post(`/services/${service.getNs()}/${service.getName()}/port-forward/${port.port}`, {})
      .catch(error => {
        Notifications.error(error);
      })
      .finally(() => {
        this.waiting = false;
      });
  }

  render() {
    const { service } = this.props;
    return (
      <div className={cssNames("ServicePorts", { waiting: this.waiting })}>
        {
          service.getPorts().map((port) => {
            return(
              <p key={port.toString()}>
                <span title={_i18n._(t`Open in a browser`)} onClick={() => this.portForward(port) }>
                  {port.toString()}
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
