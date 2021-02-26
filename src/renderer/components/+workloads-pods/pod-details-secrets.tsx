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
  @observable secrets: Secret[] = [];

  @disposeOnUnmount
  secretsLoader = autorun(async () => {
    const { pod } = this.props;

    this.secrets = (await Promise.all(
      pod.getSecrets().map(secretName => secretsApi.get({
        name: secretName,
        namespace: pod.getNs(),
      }))
    )).filter(Boolean);
  });

  render() {
    const { pod } = this.props;

    return (
      <div className="PodDetailsSecrets">
        {
          pod.getSecrets().map(secretName => {
            const secret = this.secrets.find(secret => secret.getName() === secretName);

            if (secret) {
              return this.renderSecretLink(secret);
            } else {
              return (
                <>
                  {secretName}
                </>
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
