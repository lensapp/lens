import React from "react";

import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { ClusterModel } from "../../../common/cluster-store";
import { AccessError, ExistError, LoadKubeError } from "../../../common/kube-helpers";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { isMac } from "../../../common/vars";

export interface ClusterDeadStatusProps {
  cluster: ClusterModel,
  error: LoadKubeError,
}

@observer
export class ClusterDeadStatus extends React.Component<ClusterDeadStatusProps> {
  renderError(error: LoadKubeError) {
    if (error instanceof AccessError) {
      return <>
        <p><Trans>The kube config file related to this cluster is no longer accessible by Lens.</Trans></p>
        <p><Trans>Lens cannot connect to this cluster.</Trans></p>
        {isMac && (
          <p><Trans>This may have resulted in a recent macOS update locking down files.</Trans></p>
        )}
        <p><Trans>If you allow Lens to access your home directory, it may rectify the problem.</Trans></p>
        <p className="monospace">{error.pathname}</p>
      </>;
    }

    if (error instanceof ExistError) {
      return <>
        <p><Trans>The kube config file related to this cluster no longer exists.</Trans></p>
        <p><Trans>Either it has been moved by another process or it was deleted.</Trans></p>
        <p><Trans>To fix this error, either recreate the config file in the same location or delete and re-add this cluster.</Trans></p>
        <p className="monospace">{error.pathname}</p>
      </>;
    }

    return <>
      <p><Trans>An unknown error of type "{error.type}" occured while loading this cluster's kube config.</Trans></p>
    </>;
  }

  render() {
    const classNames = cssNames("ClusterStatus flex column gaps box center align-center justify-center");
    const { cluster, error } = this.props;

    return <div className={classNames}>
      <Icon material="cloud_off" className="error" />
      <h2>
        {cluster.preferences.clusterName || cluster.contextName}
      </h2>
      {this.renderError(error)}
    </div>;
  }
}
