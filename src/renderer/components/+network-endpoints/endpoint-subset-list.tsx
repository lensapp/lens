/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./endpoint-subset-list.scss";

import React from "react";
import { observer } from "mobx-react";
import { EndpointSubset, Endpoint, EndpointAddress} from "../../api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { boundMethod } from "../../utils";
import { lookupApiLink } from "../../api/kube-api";
import { Link } from "react-router-dom";
import { getDetailsUrl } from "../kube-object";

interface Props {
  subset: EndpointSubset;
  endpoint: Endpoint;
}

@observer
export class EndpointSubsetList extends React.Component<Props> {

  getAddressTableRow(ip: string) {
    const { subset } = this.props;
    const address = subset.getAddresses().find(address => address.getId() == ip);

    return this.renderAddressTableRow(address);
  }

  @boundMethod
  getNotReadyAddressTableRow(ip: string) {
    const { subset} = this.props;
    const address = subset.getNotReadyAddresses().find(address => address.getId() == ip);

    return this.renderAddressTableRow(address);
  }

  @boundMethod
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
            !virtual && addresses.map(address => this.getAddressTableRow(address.getId()))
          }
        </Table>
      </div>
    );
  }

  @boundMethod
  renderAddressTableRow(address: EndpointAddress) {
    const { endpoint } = this.props;

    return (
      <TableRow
        key={address.getId()}
        nowrap
      >
        <TableCell className="ip">{address.ip}</TableCell>
        <TableCell className="name">{address.hostname}</TableCell>
        <TableCell className="target">
          { address.targetRef && (
            <Link to={getDetailsUrl(lookupApiLink(address.getTargetRef(), endpoint))}>
              {address.targetRef.name}
            </Link>
          )}
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const { subset } = this.props;
    const addresses = subset.getAddresses();
    const notReadyAddresses = subset.getNotReadyAddresses();
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
              { !addressesVirtual && addresses.map(address => this.getAddressTableRow(address.getId())) }
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
              { !notReadyAddressesVirtual && notReadyAddresses.map(address => this.getNotReadyAddressTableRow(address.getId())) }
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
            subset.ports.map(port => {
              return (
                <TableRow
                  key={port.port}
                  nowrap
                >
                  <TableCell className="name">{port.port}</TableCell>
                  <TableCell className="name">{port.name}</TableCell>
                  <TableCell className="node">{port.protocol}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}
