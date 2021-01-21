import "./pod-details-secrets.scss";

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../api/endpoints";
import { getDetailsUrl } from "../kube-object";
import { autobind } from "../../utils";

interface Props {
  pod: Pod;
}

@observer
export class PodDetailsSecrets extends Component<Props> {
  // either secrets or just their names
  @observable secrets: (Secret | string)[] = [];

  @disposeOnUnmount
  secretsLoader = autorun(() => {
    const { pod } = this.props;

    Promise.all(
      pod.getSecrets()
        .map(secretName => (
          secretsApi
            .get({
              name: secretName,
              namespace: pod.getNs(),
            })
            .catch(error => (console.error("Failed to load secret details", error), secretName))
            // res is undefined if context doesn't have get/list secrets
        ))
    )
      .then(secrets => this.secrets = secrets)
      .catch(error => console.log("Failed to load secret details", error));
  });

  @autobind()
  renderSecret(secret: Secret | string) {
    if (typeof secret === "string") {
      return <React.Fragment key={secret}>{secret}</React.Fragment>;
    }

    return (
      <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
        {secret.getName()}
      </Link>
    );
  }

  render() {
    return (
      <div className="PodDetailsSecrets">
        {this.secrets.map(this.renderSecret)}
      </div>
    );
  }
}
