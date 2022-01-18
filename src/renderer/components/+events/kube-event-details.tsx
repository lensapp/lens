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



