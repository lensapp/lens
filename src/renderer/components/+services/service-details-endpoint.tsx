/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "../../utils";
import type { EndpointStore } from "../+endpoints/store";
import { Spinner } from "../spinner";
import { showDetails } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import endpointStoreInjectable from "../+endpoints/store.injectable";

export interface ServiceDetailsEndpointProps {
  endpoint: KubeObject;
}

interface Dependencies {
  endpointStore: EndpointStore;
}

const NonInjectedServiceDetailsEndpoint = observer(({ endpointStore, endpoint }: Dependencies & ServiceDetailsEndpointProps) => {
  if (!endpoint) {
    if (!endpointStore.isLoaded) {
      return (
        <div className="PodDetailsList flex justify-center">
          <Spinner/>
        </div>
      );
    }

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
          key={endpoint.getId()}
          nowrap
          onClick={prevDefault(() => showDetails(endpoint.selfLink, false))}
        >
          <TableCell className="name">{endpoint.getName()}</TableCell>
          <TableCell className="endpoints">{ endpoint.toString()}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
});

export const ServiceDetailsEndpoint = withInjectables<Dependencies, ServiceDetailsEndpointProps>(NonInjectedServiceDetailsEndpoint, {
  getProps: (di, props) => ({
    endpointStore: di.inject(endpointStoreInjectable),
    ...props,
  }),
});

