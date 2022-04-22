/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./event-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeEvent } from "../../../common/k8s-api/endpoints/events.api";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import logger from "../../../common/logger";
import { DurationAbsoluteTimestamp } from "./duration-absolute";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import { cssNames } from "../../utils";

export interface EventDetailsProps extends KubeObjectDetailsProps<KubeEvent> {
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
}

const NonInjectedEventDetails = observer(({
  apiManager,
  getDetailsUrl,
  object: event,
  className,
}: Dependencies & EventDetailsProps) => {
  if (!event) {
    return null;
  }

  if (!(event instanceof KubeEvent)) {
    logger.error("[EventDetails]: passed object that is not an instanceof KubeEvent", event);

    return null;
  }

  const { message, reason, count, type, involvedObject } = event;
  const { kind, name, namespace, fieldPath } = involvedObject;

  return (
    <div className={cssNames("EventDetails", className)}>
      <KubeObjectMeta object={event}/>

      <DrawerItem name="Message">
        {message}
      </DrawerItem>
      <DrawerItem name="Reason">
        {reason}
      </DrawerItem>
      <DrawerItem name="Source">
        {event.getSource()}
      </DrawerItem>
      <DrawerItem name="First seen">
        <DurationAbsoluteTimestamp timestamp={event.firstTimestamp} />
      </DrawerItem>
      <DrawerItem name="Last seen">
        <DurationAbsoluteTimestamp timestamp={event.lastTimestamp} />
      </DrawerItem>
      <DrawerItem name="Count">
        {count}
      </DrawerItem>
      <DrawerItem name="Type" className="type">
        <span className={kebabCase(type)}>{type}</span>
      </DrawerItem>

      <DrawerTitle>Involved object</DrawerTitle>
      <Table>
        <TableHead>
          <TableCell>Name</TableCell>
          <TableCell>Namespace</TableCell>
          <TableCell>Kind</TableCell>
          <TableCell>Field Path</TableCell>
        </TableHead>
        <TableRow>
          <TableCell>
            <Link to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))}>
              {name}
            </Link>
          </TableCell>
          <TableCell>{namespace}</TableCell>
          <TableCell>{kind}</TableCell>
          <TableCell>{fieldPath}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
});

export const EventDetails = withInjectables<Dependencies, EventDetailsProps>(NonInjectedEventDetails, {
  getProps: (di, props) => ({
    ...props,
    apiManager: di.inject(apiManagerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
  }),
});
