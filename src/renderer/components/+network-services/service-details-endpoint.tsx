/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "../../utils";
import { endpointsStore } from "../+network-endpoints/legacy-store";
import { Spinner } from "../spinner";
import { showDetails } from "../kube-detail-params";
import logger from "../../../common/logger";
import { Endpoints } from "../../../common/k8s-api/endpoints";

export interface ServiceDetailsEndpointProps {
  endpoints: Endpoints;
}

@observer
export class ServiceDetailsEndpoint extends React.Component<ServiceDetailsEndpointProps> {
  render() {
    const { endpoints } = this.props;

    if (!endpoints && !endpointsStore.isLoaded) return (
      <div className="PodDetailsList flex justify-center"><Spinner/></div>
    );

    if (!endpoints) {
      return null;
    }

    if (!(endpoints instanceof Endpoints)) {
      logger.error("[ServiceDetailsEndpoint]: passed object that is not an instanceof Endpoints", endpoints);

      return null;
    }

    return (
      <div className="EndpointList flex column">
        <Table
          selectable
          virtual={false}
          scrollable={false}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" >Name</TableCell>
            <TableCell className="endpoints">Endpoints</TableCell>
          </TableHead>
          <TableRow
            key={endpoints.getId()}
            nowrap
            onClick={prevDefault(() => showDetails(endpoints.selfLink, false))}
          >
            <TableCell className="name">{endpoints.getName()}</TableCell>
            <TableCell className="endpoints">{ endpoints.toString()}</TableCell>
          </TableRow>
        </Table>
      </div>
    );
  }
}
