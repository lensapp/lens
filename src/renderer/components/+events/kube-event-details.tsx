import "./kube-event-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObject } from "../../api/kube-object";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cssNames } from "../../utils";
import { eventStore } from "./event.store";

export interface KubeEventDetailsProps {
  object: KubeObject;
}

@observer
export class KubeEventDetails extends React.Component<KubeEventDetailsProps> {
  async componentDidMount() {
    eventStore.reloadAll();
  }

  render() {
    const { object } = this.props;
    const events = eventStore.getEventsByObject(object);

    if (!events.length) {
      return (
        <DrawerTitle className="flex gaps align-center">
          <span>Events</span>
        </DrawerTitle>
      );
    }

    return (
      <div>
        <DrawerTitle className="flex gaps align-center">
          <span>Events</span>
        </DrawerTitle>
        <div className="KubeEventDetails">
          {events.map(evt => {
            const { message, count, lastTimestamp, involvedObject } = evt;

            return (
              <div className="event" key={evt.getId()}>
                <div className={cssNames("title", { warning: evt.isWarning() })}>
                  {message}
                </div>
                <DrawerItem name="Source">
                  {evt.getSource()}
                </DrawerItem>
                <DrawerItem name="Count">
                  {count}
                </DrawerItem>
                <DrawerItem name="Sub-object">
                  {involvedObject.fieldPath}
                </DrawerItem>
                <DrawerItem name="Last seen">
                  {lastTimestamp}
                </DrawerItem>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
