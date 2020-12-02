import "./service-accounts-secret.scss";

import React from "react";
import moment from "moment";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon";
import { Secret } from "../../api/endpoints/secret.api";
import { prevDefault } from "../../utils";

interface Props {
  secret: Secret;
}

interface State {
  showToken: boolean;
}

export class ServiceAccountsSecret extends React.Component<Props, State> {
  public state: State = {
    showToken: false,
  };

  renderSecretValue() {
    const { secret } = this.props;
    const { showToken } = this.state;

    return (
      <>
        {!showToken && (
          <>
            <span className="asterisks">{Array(16).fill("•").join("")}</span>
            <Icon
              small material="lock_open"
              tooltip={<Trans>Show value</Trans>}
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

  render() {
    const { metadata: { name, creationTimestamp }, type } = this.props.secret;

    return (
      <div className="ServiceAccountsSecret box grow-fixed">
        <div className="secret-row">
          <span className="name"><Trans>Name</Trans>: </span>
          <span className="value">{name}</span>
        </div>
        <div className="secret-row">
          <span className="name"><Trans>Value</Trans>: </span>
          <span className="value flex align-center">{this.renderSecretValue()}</span>
        </div>
        <div className="secret-row">
          <span className="name"><Trans>Created at</Trans>: </span>
          <span className="value" title={creationTimestamp}>
            {moment(creationTimestamp).format("LLL")}
          </span>
        </div>
        <div className="secret-row">
          <span className="name"><Trans>Type</Trans>: </span>
          <span className="value">{type}</span>
        </div>
      </div>
    );
  }
}