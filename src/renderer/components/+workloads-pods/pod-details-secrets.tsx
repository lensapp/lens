/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-secrets.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

@observer
export class PodDetailsSecrets extends Component<PodDetailsSecretsProps> {
  @observable secrets: Map<string, Secret> = observable.map<string, Secret>();

  componentDidMount(): void {
    disposeOnUnmount(this, [
      autorun(async () => {
        const { pod } = this.props;

        const secrets = await Promise.all(
          pod.getSecrets().map(secretName => secretsApi.get({
            name: secretName,
            namespace: pod.getNs(),
          })),
        );

        secrets.forEach(secret => secret && this.secrets.set(secret.getName(), secret));
      }),
    ]);
  }

  constructor(props: PodDetailsSecretsProps) {
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
