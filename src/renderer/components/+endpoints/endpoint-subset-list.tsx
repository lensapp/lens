/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoint-subset-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { EndpointSubset, Endpoint, EndpointAddress } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow, TableRowProps } from "../table";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";

export interface EndpointSubsetListProps {
  subset: EndpointSubset;
  endpoint: Endpoint;
}

interface Dependencies {
  apiManager: ApiManager;
}

const NonInjectedEndpointSubsetList = observer(({ apiManager, subset, endpoint }: Dependencies & EndpointSubsetListProps) => {
  const renderAddressTableRow = (address: EndpointAddress) => (
    <TableRow
      key={address.getId()}
      nowrap
    >
      <TableCell className="ip">{address.ip}</TableCell>
      <TableCell className="name">{address.hostname}</TableCell>
      <TableCell className="target">
        { address.targetRef && (
          <Link to={getDetailsUrl(apiManager.lookupApiLink(address.getTargetRef(), endpoint))}>
            {address.targetRef.name}
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
  const getAddressTableRow = (ip: string) => renderAddressTableRow(subset.getAddresses().find(address => address.getId() == ip));
  const getNotReadyAddressTableRow = (ip: string) => renderAddressTableRow(subset.getNotReadyAddresses().find(address => address.getId() == ip));

  interface RenderAddressesTableArgs {
    getTableRow: (ip: string) => React.ReactElement<TableRowProps<any>>;
    title: string;
    addresses: EndpointAddress[];
    virtual: boolean;
  }

  const renderAddressTable = ({ getTableRow, title, addresses, virtual }: RenderAddressesTableArgs) => (
    <div>
      <div className="title flex gaps">{title}</div>
      <Table
        items={addresses}
        selectable={false}
        virtual={virtual}
        scrollable={false}
        getTableRow={getTableRow}
        className="box grow"
      >
        <TableHead>
          <TableCell className="ip">IP</TableCell>
          <TableCell className="name">Hostname</TableCell>
          <TableCell className="target">Target</TableCell>
        </TableHead>
        {
          !virtual && addresses.map(address => getTableRow(address.getId()))
        }
      </Table>
    </div>
  );

  const addresses = subset.getAddresses();
  const notReadyAddresses = subset.getNotReadyAddresses();
  const addressesVirtual = addresses.length > 100;
  const notReadyAddressesVirtual = notReadyAddresses.length > 100;

  return (
    <div className="EndpointSubsetList flex column">
      {addresses.length > 0 && (
        renderAddressTable({
          getTableRow: getAddressTableRow,
          title: "Addresses",
          addresses,
          virtual: addressesVirtual,
        })
      )}
      {notReadyAddresses.length > 0 && (
        renderAddressTable({
          getTableRow: getNotReadyAddressTableRow,
          title: "Not Ready Addresses",
          addresses: notReadyAddresses,
          virtual: notReadyAddressesVirtual,
        })
      )}

      <div className="title flex gaps">Ports</div>
      <Table
        selectable={false}
        virtual={false}
        scrollable={false}
        className="box grow"
      >
        <TableHead>
          <TableCell className="port">Port</TableCell>
          <TableCell className="name">Name</TableCell>
          <TableCell className="protocol">Protocol</TableCell>
        </TableHead>
        {
          subset.ports.map(port => (
            <TableRow
              key={port.port}
              nowrap
            >
              <TableCell className="name">{port.port}</TableCell>
              <TableCell className="name">{port.name}</TableCell>
              <TableCell className="node">{port.protocol}</TableCell>
            </TableRow>
          ))
        }
      </Table>
    </div>
  );
});

export const EndpointSubsetList = withInjectables<Dependencies, EndpointSubsetListProps>(NonInjectedEndpointSubsetList, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    ...props,
  }),
});
