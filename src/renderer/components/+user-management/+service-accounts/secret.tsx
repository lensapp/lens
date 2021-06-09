/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./secret.scss";

import moment from "moment";
import React from "react";

import type { Secret } from "../../../api/endpoints/secret.api";
import { prevDefault } from "../../../utils";
import { Icon } from "../../icon";

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

  render() {
    const { metadata: { name, creationTimestamp }, type } = this.props.secret;

    return (
      <div className="ServiceAccountsSecret box grow-fixed">
        <div className="secret-row">
          <span className="name">Name: </span>
          <span className="value">{name}</span>
        </div>
        <div className="secret-row">
          <span className="name">Value: </span>
          <span className="value flex align-center">{this.renderSecretValue()}</span>
        </div>
        <div className="secret-row">
          <span className="name">Created at: </span>
          <span className="value" title={creationTimestamp}>
            {moment(creationTimestamp).format("LLL")}
          </span>
        </div>
        <div className="secret-row">
          <span className="name">Type: </span>
          <span className="value">{type}</span>
        </div>
      </div>
    );
  }
}
