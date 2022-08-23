/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoint-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Endpoints } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";
import logger from "../../../common/logger";

export interface EndpointsDetailsProps extends KubeObjectDetailsProps<Endpoints> {
}

@observer
export class EndpointsDetails extends React.Component<EndpointsDetailsProps> {
  render() {
    const { object: endpoint } = this.props;

    if (!endpoint) {
      return null;
    }

    if (!(endpoint instanceof Endpoints)) {
      logger.error("[EndpointDetails]: passed object that is not an instanceof Endpoint", endpoint);

      return null;
    }

    return (
      <div className="EndpointDetails">
        <KubeObjectMeta object={endpoint}/>
        <DrawerTitle>Subsets</DrawerTitle>
        {
          endpoint.getEndpointSubsets().map((subset) => (
            <EndpointSubsetList
              key={subset.toString()}
              subset={subset}
              endpoint={endpoint}
            />
          ))
        }
      </div>
    );
  }
}
