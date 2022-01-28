/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-event-details.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cssNames } from "../../utils";
import { LocaleDate } from "../locale-date";
import type { EventStore } from "./store";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import eventStoreInjectable from "./store.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface KubeEventDetailsProps {
  object: KubeObject;
}

interface Dependencies {
  eventStore: EventStore;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedKubeEventDetails = observer(({ kubeWatchApi, eventStore, object }: Dependencies & KubeEventDetailsProps) => {
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      eventStore,
    ])
  ), []);

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
});

export const KubeEventDetails = withInjectables<Dependencies, KubeEventDetailsProps>(NonInjectedKubeEventDetails, {
  getProps: (di, props) => ({
    eventStore: di.inject(eventStoreInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});

