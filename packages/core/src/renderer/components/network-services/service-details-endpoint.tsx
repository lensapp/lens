/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "@k8slens/utilities";
import type { Logger } from "../../../common/logger";
import { Endpoints } from "@k8slens/kube-object";
import type { ShowDetails } from "../kube-detail-params/show-details.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";
import showDetailsInjectable from "../kube-detail-params/show-details.injectable";

export interface ServiceDetailsEndpointProps {
  endpoints: Endpoints;
}

interface Dependencies {
  logger: Logger;
  showDetails: ShowDetails;
}

@observer
class NonInjectedServiceDetailsEndpoint extends React.Component<ServiceDetailsEndpointProps & Dependencies> {
  render() {
    const { endpoints } = this.props;

    if (!endpoints) {
      return null;
    }

    if (!(endpoints instanceof Endpoints)) {
      this.props.logger.error("[ServiceDetailsEndpoint]: passed object that is not an instanceof Endpoints", endpoints);

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
          <TableHead flat>
            <TableCell className="name" >Name</TableCell>
            <TableCell className="endpoints">Endpoints</TableCell>
          </TableHead>
          <TableRow
            key={endpoints.getId()}
            nowrap
            onClick={prevDefault(() => this.props.showDetails(endpoints.selfLink, false))}
          >
            <TableCell className="name">{endpoints.getName()}</TableCell>
            <TableCell className="endpoints">{ endpoints.toString()}</TableCell>
          </TableRow>
        </Table>
      </div>
    );
  }
}

export const ServiceDetailsEndpoint = withInjectables<Dependencies, ServiceDetailsEndpointProps>(NonInjectedServiceDetailsEndpoint, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
    showDetails: di.inject(showDetailsInjectable),
  }),
});
