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

import "./pod-details-secrets.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";

interface Props {
  pod: Pod;
}

@observer
export class PodDetailsSecrets extends Component<Props> {
  @observable secrets: Map<string, Secret> = observable.map<string, Secret>();

  @disposeOnUnmount
  secretsLoader = autorun(async () => {
    const { pod } = this.props;

    const secrets = await Promise.all(
      pod.getSecrets().map(secretName => secretsApi.get({
        name: secretName,
        namespace: pod.getNs(),
      })),
    );

    secrets.forEach(secret => secret && this.secrets.set(secret.getName(), secret));
  });

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  render() {
    const { pod } = this.props;

    return (
      <div className="PodDetailsSecrets">
        {
          pod.getSecrets().map(secretName => {
            const secret = this.secrets.get(secretName);

            if (secret) {
              return this.renderSecretLink(secret);
            } else {
              return (
                <span key={secretName}>{secretName}</span>
              );
            }
          })
        }
      </div>
    );
  }

  protected renderSecretLink(secret: Secret) {
    return (
      <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
        {secret.getName()}
      </Link>
    );
  }
}
