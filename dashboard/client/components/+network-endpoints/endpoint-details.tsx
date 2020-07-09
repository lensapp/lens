import "./endpoint-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerTitle } from "../drawer";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../kube-object";
import { Endpoint, endpointApi } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";

interface Props extends KubeObjectDetailsProps<Endpoint> {
}

@observer
export class EndpointDetails extends React.Component<Props> {
  render(): JSX.Element {
    const { object: endpoint } = this.props;
    if (!endpoint) {
      return;
    }
    return (
      <div className="EndpointDetails">
        <KubeObjectMeta object={endpoint}/>
        <DrawerTitle title={<Trans>Subsets</Trans>}/>
        {
          endpoint.getEndpointSubsets().map((subset, index) => (
            <EndpointSubsetList key={`${index}`} subset={subset} endpoint={endpoint} />
          ))
        }

        <KubeEventDetails object={endpoint}/>
      </div>
    );
  }
}

apiManager.registerViews(endpointApi, {
  Details: EndpointDetails,
});
