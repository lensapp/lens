import React from "react";
import { Cluster } from "../../../main/cluster";
import { InstallFeature } from "./components/install-feature";
import { SubTitle } from "../layout/sub-title";
import { MetricsFeature } from "../../../features/metrics";
import { UserModeFeature } from "../../../features/user-mode";

interface Props {
  cluster: Cluster;
}

export class Features extends React.Component<Props> {
  render() {
    const { cluster } = this.props;

    return (
      <div>
        <h2>Features</h2>
        <InstallFeature cluster={cluster} feature={MetricsFeature.id}>
          <>
            <SubTitle title="Metrics"/>
            <p>
              Enable timeseries data visualization (Prometheus stack) for your cluster.
              Install this only if you don't have existing Prometheus stack installed.
              You can see preview of manifests{" "}
              <a href="https://github.com/lensapp/lens/tree/master/src/features/metrics" target="_blank">here</a>.
            </p>
          </>
        </InstallFeature>
        <InstallFeature cluster={cluster} feature={UserModeFeature.id}>
          <>
            <SubTitle title="User Mode"/>
            <p>
              User Mode feature enables non-admin users to see namespaces they have access to.{" "}
              This is achieved by configuring RBAC rules so that every authenticated user is granted to list namespaces.
            </p>
          </>
        </InstallFeature>
      </div>
    );
  }
}