/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Endpoint } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";

export interface EndpointDetailsProps extends KubeObjectDetailsProps<Endpoint> {
}

interface Dependencies {

}

const NonInjectedEndpointDetails = observer(({ object: endpoint }: Dependencies & EndpointDetailsProps) => {
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
});

export const EndpointDetails = withInjectables<Dependencies, EndpointDetailsProps>(NonInjectedEndpointDetails, {
  getProps: (di, props) => ({

    ...props,
  }),
});

