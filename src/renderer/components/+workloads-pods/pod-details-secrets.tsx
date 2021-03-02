import "./pod-details-secrets.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../api/endpoints";
import { getDetailsUrl } from "../kube-object";

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
      }))
    );

    secrets.forEach(secret => secret && this.secrets.set(secret.getName(), secret));
  });

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
