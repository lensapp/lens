/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./kube-event-details.module.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { KubeObject } from "@k8slens/kube-object";
import { DrawerItem, DrawerTitle } from "../drawer";
import { cssNames } from "@k8slens/utilities";
import { LocaleDate } from "../locale-date";
import type { EventStore } from "./store";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";

import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import eventStoreInjectable from "./store.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface KubeEventDetailsProps {
  object: KubeObject;
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  eventStore: EventStore;
  logger: Logger;
}

@observer
class NonInjectedKubeEventDetails extends React.Component<KubeEventDetailsProps & Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.eventStore,
      ]),
    ]);
  }

  render() {
    const { object, eventStore } = this.props;

    if (!object) {
      return null;
    }

    if (!(object instanceof KubeObject)) {
      this.props.logger.error("[KubeEventDetails]: passed object that is not an instanceof KubeObject", object);

      return null;
    }

    const events = eventStore.getEventsByObject(object);

    return (
      <div>
        <DrawerTitle>
          <span>Events</span>
        </DrawerTitle>
        {events.length > 0 && (
          <div className={styles.KubeEventDetails}>
            {events.map(event => (
              <div className={styles.event} key={event.getId()}>
                <div className={cssNames(styles.title, { [styles.warning]: event.isWarning() })}>
                  {event.message}
                </div>
                <DrawerItem name="Source">
                  {event.getSource()}
                </DrawerItem>
                <DrawerItem name="Count">
                  {event.count}
                </DrawerItem>
                <DrawerItem name="Sub-object">
                  {event.involvedObject.fieldPath}
                </DrawerItem>
                {event.lastTimestamp && (
                  <DrawerItem name="Last seen">
                    <LocaleDate date={event.lastTimestamp} />
                  </DrawerItem>
                )}
              </div>
            ))}
          </div>
        )}
        {events.length === 0 && (
          <div className={styles.empty}>
            No events found
          </div>
        )}
      </div>
    );
  }
}

export const KubeEventDetails = withInjectables<Dependencies, KubeEventDetailsProps>(NonInjectedKubeEventDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    eventStore: di.inject(eventStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});



