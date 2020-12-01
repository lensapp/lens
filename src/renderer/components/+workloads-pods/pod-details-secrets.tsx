import "./pod-details-secrets.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../api/endpoints";
import { getDetailsUrl } from "../../navigation";

interface Props {
  pod: Pod;
}

@observer
export class PodDetailsSecrets extends Component<Props> {
  @observable secrets: Secret[] = [];

  @disposeOnUnmount
  secretsLoader = autorun(async () => {
    const { pod } = this.props;

    this.secrets = await Promise.all(
      pod.getSecrets().map(secretName => secretsApi.get({
        name: secretName,
        namespace: pod.getNs(),
      }))
    );
  });

  render() {
    return (
      <div className="PodDetailsSecrets">
        {
          this.secrets.map(secret => {
            return (
              <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
                {secret.getName()}
              </Link>
            );
          })
        }
      </div>
    );
  }
}
