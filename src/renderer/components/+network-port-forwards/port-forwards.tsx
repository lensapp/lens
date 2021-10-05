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

import "./port-forwards.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { PortForwardItem, portForwardStore } from "../../port-forward";
import { PortForwardMenu } from "./port-forward-menu";

enum columnId {
  name = "name",
  namespace = "namespace",
  kind = "kind",
  port = "port",
  forwardPort = "forwardPort",
}

@observer
export class PortForwards extends React.Component {

  componentDidMount() {
    disposeOnUnmount(this, [
      portForwardStore.watch(),
    ]);
  }

  renderRemoveDialogMessage(selectedItems: PortForwardItem[]) {
    const forwardPorts = selectedItems.map(item => item.getForwardPort()).join(", ");

    return (
      <div>
        <>Stop forwarding from <b>{forwardPorts}</b>?</>
      </div>
    );
  }


  render() {
    return (
      <>
        <ItemListLayout
          isConfigurable
          tableId="port_forwards"
          className="PortForwards" store={portForwardStore}
          sortingCallbacks={{
            [columnId.name]: item => item.getName(),
            [columnId.namespace]: item => item.getNs(),
            [columnId.kind]: item => item.getKind(),
            [columnId.port]: item => item.getPort(),
            [columnId.forwardPort]: item => item.getForwardPort(),
          }}
          searchFilters={[
            item => item.getSearchFields(),
          ]}
          renderHeaderTitle="Port Forwarding"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Kind", className: "kind", sortBy: columnId.kind, id: columnId.kind },
            { title: "Pod Port", className: "port", sortBy: columnId.port, id: columnId.port },
            { title: "Local Port", className: "forwardPort", sortBy: columnId.forwardPort, id: columnId.forwardPort },
          ]}
          renderTableContents={item => [
            item.getName(),
            item.getNs(),
            item.getKind(),
            item.getPort(),
            item.getForwardPort(),
          ]}
          renderItemMenu={pf => (
            <PortForwardMenu
              portForward={pf}
              removeConfirmationMessage={this.renderRemoveDialogMessage([pf])}
            />
          )}
          customizeRemoveDialog={selectedItems => ({
            message: this.renderRemoveDialogMessage(selectedItems)
          })}
        />
      </>
    );
  }
}
