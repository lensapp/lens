/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoint-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Endpoint } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";
import logger from "../../../common/logger";

interface Props extends KubeObjectDetailsProps<Endpoint> {
}

@observer
export class EndpointDetails extends React.Component<Props> {
  render() {
    const { object: endpoint } = this.props;

    if (!endpoint) {
      return null;
    }

    if (!(endpoint instanceof Endpoint)) {
      logger.error("[EndpointDetails]: passed object that is not an instanceof Endpoint", endpoint);

      return null;
    }

    return (
      <div className="EndpointDetails">
        <KubeObjectMeta object={endpoint}/>
        <DrawerTitle title="Subsets"/>
        {
          endpoint.getEndpointSubsets().map((subset) => (
            <EndpointSubsetList key={subset.toString()} subset={subset} endpoint={endpoint} />
          ))
        }
      </div>
    );
  }
}
