/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoint-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Endpoints } from "@k8slens/kube-object";
import { EndpointSubsetList } from "./endpoint-subset-list";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

export interface EndpointsDetailsProps extends KubeObjectDetailsProps<Endpoints> {
}

interface Dependencies {
  logger: Logger;
}

@observer
class NonInjectedEndpointsDetails extends React.Component<EndpointsDetailsProps & Dependencies> {
  render() {
    const { object: endpoint } = this.props;

    if (!endpoint) {
      return null;
    }

    if (!(endpoint instanceof Endpoints)) {
      this.props.logger.error("[EndpointDetails]: passed object that is not an instanceof Endpoint", endpoint);

      return null;
    }

    return (
      <div className="EndpointDetails">
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

export const EndpointsDetails = withInjectables<Dependencies, EndpointsDetailsProps>(NonInjectedEndpointsDetails, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});
