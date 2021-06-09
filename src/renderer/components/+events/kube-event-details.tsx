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
import { observer } from "mobx-react";
import type { KubeObject } from "../../api/kube-object";
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
