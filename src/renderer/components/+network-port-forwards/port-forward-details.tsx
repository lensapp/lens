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

import "./port-forward-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { portForwardAddress, PortForwardItem } from "../../port-forward";
import { Drawer, DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { podsApi, serviceApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";
import { PortForwardMenu } from "./port-forward-menu";

interface Props {
  portForward: PortForwardItem;
  hideDetails(): void;
}

export class PortForwardDetails extends React.Component<Props> {

  renderResourceName() {
    const { portForward } = this.props;
    const name = portForward.getName();
    const api = {
      "service": serviceApi,
      "pod": podsApi,
    }[portForward.kind];

    if (!api) {
      return (
        <span>{name}</span>
      );
    }

    return (
      <Link to={getDetailsUrl(api.getUrl({ name, namespace: portForward.getNs() }))}>
        {name}
      </Link>
    );
  }

  renderContent() {
    const { portForward } = this.props;

    if (!portForward) return null;

    return (
      <div>
        <DrawerItem name="Resource Name">
          {this.renderResourceName()}
        </DrawerItem>
        <DrawerItem name="Namespace">
          {portForward.getNs()}
        </DrawerItem>
        <DrawerItem name="Kind">
          {portForward.getKind()}
        </DrawerItem>
        <DrawerItem name="Pod Port">
          {portForward.getPort()}
        </DrawerItem>
        <DrawerItem name="Local Port">
          {portForward.getForwardPort()}
        </DrawerItem>
        <DrawerItem name="Protocol">
          {portForward.getProtocol()}
        </DrawerItem>
        <DrawerItem name="Status">
          <span className={cssNames("status", portForward.getStatus().toLowerCase())}>{portForward.getStatus()}</span>
        </DrawerItem>
      </div>
    );
  }

  render() {
    const { hideDetails, portForward } = this.props;
    const toolbar = <PortForwardMenu portForward={portForward} toolbar hideDetails={hideDetails}/>;

    return (
      <Drawer
        className="PortForwardDetails"
        usePortal={true}
        open={!!portForward}
        title={`Port Forward: ${portForwardAddress(portForward)}`}
        onClose={hideDetails}
        toolbar={toolbar}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}
