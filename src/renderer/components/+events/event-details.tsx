import "./event-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps, getDetailsUrl } from "../kube-object";
import { KubeEvent } from "../../api/endpoints/events.api";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { lookupApiLink } from "../../api/kube-api";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { LocaleDate } from "../locale-date";

interface Props extends KubeObjectDetailsProps<KubeEvent> {
}

@observer
export class EventDetails extends React.Component<Props> {
  render() {
    const { object: event } = this.props;

    if (!event) return;
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
              <Link to={getDetailsUrl(lookupApiLink(involvedObject, event))}>
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

kubeObjectDetailRegistry.add({
  kind: "Event",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <EventDetails {...props}/>
  }
});
