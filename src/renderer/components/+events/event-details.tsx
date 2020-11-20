import "./event-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { KubeObjectDetailsProps } from "../kube-object";
import { KubeEvent } from "../../api/endpoints/events.api";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { getDetailsUrl } from "../../navigation";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { lookupApiLink } from "../../api/kube-api";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

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

        <DrawerItem name={<Trans>Message</Trans>}>
          {message}
        </DrawerItem>
        <DrawerItem name={<Trans>Reason</Trans>}>
          {reason}
        </DrawerItem>
        <DrawerItem name={<Trans>Source</Trans>}>
          {event.getSource()}
        </DrawerItem>
        <DrawerItem name={<Trans>First seen</Trans>}>
          {event.getFirstSeenTime()} <Trans>ago</Trans> {event.firstTimestamp}
        </DrawerItem>
        <DrawerItem name={<Trans>Last seen</Trans>}>
          {event.getLastSeenTime()} <Trans>ago</Trans> {event.lastTimestamp}
        </DrawerItem>
        <DrawerItem name={<Trans>Count</Trans>}>
          {count}
        </DrawerItem>
        <DrawerItem name={<Trans>Type</Trans>} className="type">
          <span className={kebabCase(type)}>{type}</span>
        </DrawerItem>

        <DrawerTitle title={<Trans>Involved object</Trans>}/>
        <Table>
          <TableHead>
            <TableCell><Trans>Name</Trans></TableCell>
            <TableCell><Trans>Namespace</Trans></TableCell>
            <TableCell><Trans>Kind</Trans></TableCell>
            <TableCell><Trans>Field Path</Trans></TableCell>
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
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "Event",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <EventDetails {...props}/>
  }
})
