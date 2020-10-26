import "./endpoint-details.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerTitle } from "../drawer";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../kube-object";
import { Endpoint } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Endpoint> {
}

@observer
export class EndpointDetails extends React.Component<Props> {
  render() {
    const { object: endpoint } = this.props;
    if (!endpoint) return;
    return (
      <div className="EndpointDetails">
        <KubeObjectMeta object={endpoint}/>
        <DrawerTitle title={<Trans>Subsets</Trans>}/>
        {
          endpoint.getEndpointSubsets().map((subset) => {
            return(
              <EndpointSubsetList subset={subset} endpoint={endpoint}/>
            )
          })
        }

        <KubeEventDetails object={endpoint}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Endpoints",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <EndpointDetails {...props} />
  }
})
