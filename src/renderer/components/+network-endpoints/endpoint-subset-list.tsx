/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./endpoint-subset-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { EndpointSubset, Endpoints, EndpointAddress } from "../../../common/k8s-api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { getDetailsUrl } from "../kube-detail-params";
import { autoBind } from "../../../common/utils";

export interface EndpointSubsetListProps {
  subset: Required<EndpointSubset>;
  endpoint: Endpoints;
}

@observer
export class EndpointSubsetList extends React.Component<EndpointSubsetListProps> {
  constructor(props: EndpointSubsetListProps) {
    super(props);
    autoBind(this);
  }

  getAddressTableRow(ip: string) {
    const address = this.props.subset.addresses.find(address => address.ip == ip);

    return this.renderAddressTableRow(address);
  }

  getNotReadyAddressTableRow(ip: string) {
    const address = this.props.subset.notReadyAddresses.find(address => address.ip == ip);

    return this.renderAddressTableRow(address);
  }

  renderAddressTable(addresses: EndpointAddress[], virtual: boolean) {
    return (
      <div>
        <div className="title flex gaps">Addresses</div>
        <Table
          items={addresses}
          selectable={false}
          virtual={virtual}
          scrollable={false}
          getTableRow={this.getAddressTableRow}
          className="box grow"
        >
          <TableHead>
            <TableCell className="ip">IP</TableCell>
            <TableCell className="name">Hostname</TableCell>
            <TableCell className="target">Target</TableCell>
          </TableHead>
          {
            !virtual && addresses.map(address => this.getAddressTableRow(address.ip))
          }
        </Table>
      </div>
    );
  }

  renderAddressTableRow(address: EndpointAddress | undefined) {
    if (!address) {
      return undefined;
    }

    const { endpoint } = this.props;

    return (
      <TableRow
        key={address.ip}
        nowrap
      >
        <TableCell className="ip">{address.ip}</TableCell>
        <TableCell className="name">{address.hostname}</TableCell>
        <TableCell className="target">
          { address.targetRef && (
            <Link to={getDetailsUrl(apiManager.lookupApiLink(address.targetRef, endpoint))}>
              {address.targetRef.name}
            </Link>
          )}
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const { subset: { addresses, ports, notReadyAddresses }} = this.props;
    const addressesVirtual = addresses.length > 100;
    const notReadyAddressesVirtual = notReadyAddresses.length > 100;

    return(
      <div className="EndpointSubsetList flex column">
        {addresses.length > 0 && (
          <div>
            <div className="title flex gaps">Addresses</div>
            <Table
              items={addresses}
              selectable={false}
              virtual={addressesVirtual}
              scrollable={false}
              getTableRow={this.getAddressTableRow}
              className="box grow"
            >
              <TableHead>
                <TableCell className="ip">IP</TableCell>
                <TableCell className="host">Hostname</TableCell>
                <TableCell className="target">Target</TableCell>
              </TableHead>
              { !addressesVirtual && addresses.map(address => this.getAddressTableRow(address.ip)) }
            </Table>
          </div>
        )}

        {notReadyAddresses.length > 0 && (
          <div>
            <div className="title flex gaps">Not Ready Addresses</div>
            <Table
              items={notReadyAddresses}
              selectable
              virtual={notReadyAddressesVirtual}
              scrollable={false}
              getTableRow={this.getNotReadyAddressTableRow}
              className="box grow"
            >
              <TableHead>
                <TableCell className="ip">IP</TableCell>
                <TableCell className="host">Hostname</TableCell>
                <TableCell className="target">Target</TableCell>
              </TableHead>
              { !notReadyAddressesVirtual && notReadyAddresses.map(address => this.getNotReadyAddressTableRow(address.ip)) }
            </Table>
          </div>
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
            ports.map(port => (
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
  }
}
