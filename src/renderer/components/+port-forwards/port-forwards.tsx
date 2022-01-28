/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./port-forwards.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import type { PortForwardItem, PortForwardStore } from "../../port-forward";
import { PortForwardMenu } from "./port-forward-menu";
import { PortForwardsRouteParams, portForwardsURL } from "../../../common/routes";
import { PortForwardDetails } from "./port-forward-details";
import { navigation } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  kind = "kind",
  port = "port",
  forwardPort = "forwardPort",
  protocol = "protocol",
  status = "status",
}

export interface PortForwardsProps extends RouteComponentProps<PortForwardsRouteParams> {
}

interface Dependencies {
  portForwardStore: PortForwardStore;
}

const NonInjectedPortForwards = observer(({ portForwardStore, match }: Dependencies & PortForwardsProps) => {
  useEffect(() => portForwardStore.watch(), []);

  const { forwardport } = match.params;
  const selectedPortForward = portForwardStore.getById(forwardport);

  const onDetails = (item: PortForwardItem) => {
    if (item === selectedPortForward) {
      hideDetails();
    } else {
      showDetails(item);
    }
  };

  const showDetails = (item: PortForwardItem) => {
    navigation.push(portForwardsURL({
      params: {
        forwardport: item.getId(),
      },
    }));
  };

  const hideDetails = () => {
    navigation.push(portForwardsURL());
  };

  const renderRemoveDialogMessage = (selectedItems: PortForwardItem[]) => {
    const forwardPorts = selectedItems.map(item => item.getForwardPort()).join(", ");

    return (
      <div>
        <>Stop forwarding from <b>{forwardPorts}</b>?</>
      </div>
    );
  };

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
          [columnId.protocol]: item => item.getProtocol(),
          [columnId.status]: item => item.getStatus(),
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
          { title: "Protocol", className: "protocol", sortBy: columnId.protocol, id: columnId.protocol },
          { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
        ]}
        renderTableContents={item => [
          item.getName(),
          item.getNs(),
          item.getKind(),
          item.getPort(),
          item.getForwardPort(),
          item.getProtocol(),
          { title: item.getStatus(), className: item.getStatus().toLowerCase() },
        ]}
        renderItemMenu={pf => (
          <PortForwardMenu
            portForward={pf}
            removeConfirmationMessage={renderRemoveDialogMessage([pf])}
          />
        )}
        customizeRemoveDialog={selectedItems => ({
          message: renderRemoveDialogMessage(selectedItems),
        })}
        detailsItem={selectedPortForward}
        onDetails={onDetails}
      />
      {selectedPortForward && (
        <PortForwardDetails
          portForward={selectedPortForward}
          hideDetails={hideDetails}
        />
      )}
    </>
  );
});

export const PortForwards = withInjectables<Dependencies, PortForwardsProps>(NonInjectedPortForwards, {
  getProps: (di, props) => ({
    portForwardStore: di.inject(portForwardStoreInjectable),
    ...props,
  }),
});
