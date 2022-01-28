/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Event } from "../../../common/k8s-api/endpoints/event.api";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { LocaleDate } from "../locale-date";
import { getDetailsUrl } from "../kube-detail-params";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";

export interface EventDetailsProps extends KubeObjectDetailsProps<Event> {
}

interface Dependencies {
  apiManager: ApiManager;
}

const NonInjectedEventDetails = observer(({ object: event, apiManager }: Dependencies & EventDetailsProps) => {
  if (!event) {
    return null;
  }

  if (!(event instanceof Event)) {
    logger.error("[EventDetails]: passed object that is not an instanceof KubeEvent", event);

    return null;
  }

  const { message, reason, count, type, involvedObject } = event;
  const { kind, name, namespace, fieldPath } = involvedObject;

  return (
    <div className="EventDetails">
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
        {event.getFirstSeenTime()} ago (<LocaleDate date={event.firstTimestamp} />)
      </DrawerItem>
      <DrawerItem name="Last seen">
        {event.getLastSeenTime()} ago (<LocaleDate date={event.lastTimestamp} />)
      </DrawerItem>
      <DrawerItem name="Count">
        {count}
      </DrawerItem>
      <DrawerItem name="Type" className="type">
        <span className={kebabCase(type)}>{type}</span>
      </DrawerItem>

      <DrawerTitle title="Involved object"/>
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
    apiManager: di.inject(apiManagerInjectable),
    ...props,
  }),
});
