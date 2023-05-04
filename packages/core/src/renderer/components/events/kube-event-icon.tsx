/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-icon.scss";

import React from "react";
import { Icon } from "@k8slens/icon";
import type { KubeObject, KubeEvent } from "@k8slens/kube-object";
import { cssNames } from "@k8slens/utilities";
import { KubeObjectAge } from "../kube-object/age";
import type { EventStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import eventStoreInjectable from "./store.injectable";

export interface KubeEventIconProps {
  object: KubeObject;
  showWarningsOnly?: boolean;
  filterEvents?: (events: KubeEvent[]) => KubeEvent[];
}

interface Dependencies {
  eventStore: EventStore;
}

class NonInjectedKubeEventIcon extends React.Component<KubeEventIconProps & Dependencies> {
  get showWarningsOnly() {
    return this.props.showWarningsOnly ?? true;
  }

  render() {
    const { object, filterEvents = (events) => events, eventStore } = this.props;
    const events = eventStore.getEventsByObject(object);
    const warnings = filterEvents(events.filter(event => event.isWarning()));

    const [event] = [...warnings, ...events]; // get latest event

    if (!event) return null;
    if (this.showWarningsOnly && !event.isWarning()) return null;

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

export const KubeEventIcon = withInjectables<Dependencies, KubeEventIconProps>(NonInjectedKubeEventIcon, {
  getProps: (di, props) => ({
    ...props,
    eventStore: di.inject(eventStoreInjectable),
  }),
});
