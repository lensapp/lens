import React from "react";
import { Cluster } from "../../../main/cluster";
import { InstallFeature } from "./components/install-feature";
import { SubTitle } from "../layout/sub-title";
import { clusterFeatureRegistry } from "../../../extensions/cluster-feature-registry";

interface Props {
  cluster: Cluster;
}

export class Features extends React.Component<Props> {
  render() {
    const { cluster } = this.props;
    return (
      <div>
        <h2>Features</h2>
        { clusterFeatureRegistry.features.map((f) => {
          return (
            <InstallFeature cluster={cluster} feature={f.feature}>
              <>
                <SubTitle title={f.title}/>
                <p>{f.description}</p>
              </>
            </InstallFeature>
          )
        })}
      </div>
    );
  }
}
