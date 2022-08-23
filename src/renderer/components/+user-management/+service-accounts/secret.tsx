/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./secret.scss";

import moment from "moment";
import React from "react";

import type { Secret } from "../../../../common/k8s-api/endpoints/secret.api";
import { prevDefault } from "../../../utils";
import { Icon } from "../../icon";

export interface ServiceAccountsSecretProps {
  secret: Secret | string;
}

interface State {
  showToken: boolean;
}

interface RenderRowArgs {
  name: string;
  value: React.ReactNode;
}

export class ServiceAccountsSecret extends React.Component<ServiceAccountsSecretProps, State> {
  public state: State = {
    showToken: false,
  };

  renderSecretValue(secret: Secret) {
    const { showToken } = this.state;

    return (
      <>
        {!showToken && (
          <>
            <span className="asterisks">{"•".repeat(16)}</span>
            <Icon
              small
              material="lock_open"
              tooltip="Show value"
              onClick={prevDefault(() => this.setState({ showToken: true }))}
            />
          </>
        )}
        {showToken && (
          <span className="raw-value">{secret.getToken()}</span>
        )}
      </>
    );
  }

  renderRow({ name, value }: RenderRowArgs) {
    return (
      <div className="secret-row">
        <span className="name">{name}</span>
        <span className="value">{value}</span>
      </div>
    );
  }

  render() {
    const { secret } = this.props;

    return (
      <div className="ServiceAccountsSecret box grow-fixed">
        {this.renderRow({
          name: "Name: ",
          value: (
            typeof secret === "string"
              ? secret
              : secret.getName()
          ),
        })}
        {this.renderRow({
          name: "Value: ",
          value: (
            typeof secret === "string"
              ? "<unknown>"
              : this.renderSecretValue(secret)
          ),
        })}
        {this.renderRow({
          name: "Created at: ",
          value: (
            typeof secret === "string" || !secret.metadata.creationTimestamp
              ? "<unknown>"
              : moment(secret.metadata.creationTimestamp).format("LLL")
          ),
        })}
        {this.renderRow({
          name: "Type: ",
          value: (
            typeof secret === "string"
              ? "<unknown>"
              : secret.type
          ),
        })}
      </div>
    );
  }
}
