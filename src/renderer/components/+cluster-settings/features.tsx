import React from "react";
import { Cluster } from "../../../main/cluster";
import { InstallFeature } from "./components/install-feature";
import { SubTitle } from "../layout/sub-title";
import { clusterFeatureRegistry } from "../../../extensions/registries/cluster-feature-registry";

interface Props {
  cluster: Cluster;
}

export class Features extends React.Component<Props> {
  render() {
    const { cluster } = this.props;
    return (
      <div>
        <h2>Features</h2>
        { clusterFeatureRegistry.getItems().map((f) => {
          return (
            <InstallFeature cluster={cluster} feature={f.feature}>
              <>
                <SubTitle title={f.title}/>
                <p><f.components.Description /></p>
              </>
            </InstallFeature>
          )
        })}
      </div>
    );
  }
}
