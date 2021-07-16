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

import "./event-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps} from "../kube-object-details";
import { getDetailsUrl } from "../kube-details";
import type { KubeEvent } from "../../api/endpoints/events.api";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { LocaleDate } from "../locale-date";
import { apiManager } from "../../api/api-manager";

interface Props extends KubeObjectDetailsProps<KubeEvent> {
}

@observer
export class EventDetails extends React.Component<Props> {
  render() {
    const { object: event } = this.props;

    if (!event) return null;
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
  }
}
