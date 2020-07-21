import "./landing-page.scss"
import React from "react";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { Trans } from "@lingui/macro";

@observer
export class LandingPage extends React.Component {
  render() {
    const noClusters = !clusterStore.hasClusters();
    return (
      <div className="LandingPage flex">
        {noClusters && (
          <div className="no-clusters flex column gaps box center">
            <h1>
              <Trans>Welcome!</Trans>
            </h1>
            <p>
              <Trans>Get started by associating one or more clusters to Lens.</Trans>
            </p>
          </div>
        )}
      </div>
    )
  }
}
