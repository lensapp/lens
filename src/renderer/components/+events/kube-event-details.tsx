/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cssNames, Disposer } from "../../utils";
import { LocaleDate } from "../locale-date";
import { eventStore } from "./event.store";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import kubeWatchApiInjectable
  from "../../kube-watch-api/kube-watch-api.injectable";

export interface KubeEventDetailsProps {
  object: KubeObject;
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer
}

@observer
class NonInjectedKubeEventDetails extends React.Component<KubeEventDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        eventStore,
      ]),
    ]);
  }

  render() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    if (!(object instanceof KubeObject)) {
      logger.error("[KubeEventDetails]: passed object that is not an instanceof KubeObject", object);

      return null;
    }

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
                  <LocaleDate date={lastTimestamp} />
                </DrawerItem>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export const KubeEventDetails = withInjectables<Dependencies, KubeEventDetailsProps>(
  NonInjectedKubeEventDetails,

  {
    getProps: (di, props) => ({
      subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
      ...props,
    }),
  },
);



