import "./kube-event-icon.scss";

import React from "react";
import { Icon } from "../icon";
import { KubeObject } from "../../api/kube-object";
import { eventStore } from "./event.store";
import { cssNames } from "../../utils";
import { KubeEvent } from "../../api/endpoints/events.api";

interface Props {
  object: KubeObject;
  showWarningsOnly?: boolean;
  filterEvents?: (events: KubeEvent[]) => KubeEvent[];
}

const defaultProps: Partial<Props> = {
  showWarningsOnly: true,
};

export class KubeEventIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const { object, showWarningsOnly, filterEvents } = this.props;
    const events = eventStore.getEventsByObject(object);
    let warnings = events.filter(evt => evt.isWarning());
    if (filterEvents) warnings = filterEvents(warnings);
    if (!events.length || (showWarningsOnly && !warnings.length)) {
      return null;
    }
    const event = [...warnings, ...events][0]; // get latest event
    return (
      <Icon
        material="warning"
        className={cssNames("KubeEventIcon", { warning: event.isWarning() })}
        tooltip={{
          children: (
            <div className="KubeEventTooltip">
              <div className="msg">{event.message}</div>
              <div className="age">
                <Icon material="access_time"/>
                {event.getAge(undefined, undefined, true)}
              </div>
            </div>
          )
        }}
      />
    )
  }
}
