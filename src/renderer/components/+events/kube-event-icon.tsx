/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-icon.scss";

import React from "react";
import { Icon } from "../icon";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { eventStore } from "./legacy-store";
import { cssNames } from "../../utils";
import type { KubeEvent } from "../../../common/k8s-api/endpoints/events.api";
import { KubeObjectAge } from "../kube-object/age";

export interface KubeEventIconProps {
  object: KubeObject;
  showWarningsOnly?: boolean;
  filterEvents?: (events: KubeEvent[]) => KubeEvent[];
}


const defaultProps: Partial<KubeEventIconProps> = {
  showWarningsOnly: true,
};

export class KubeEventIcon extends React.Component<KubeEventIconProps> {
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
                <KubeObjectAge object={event} />
              </div>
            </div>
          ),
        }}
      />
    );
  }
}
