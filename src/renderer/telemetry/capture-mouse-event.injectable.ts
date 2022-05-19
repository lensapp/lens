/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppEvent } from "../../common/app-event-bus/event-bus";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import type { EventEmitter } from "../../common/event-emitter";
import capitalize from "lodash/capitalize";

function getEventName(el: HTMLElement) {
  let headers: string[] = [];
  const levels = 3;
  let parent = el;

  const path = window.location.pathname.split("/");

  headers.push(capitalize(path[path.length-1]));

  for (let i = 0; i < levels; i++) {
    if (parent.parentElement) {
      parent = parent.parentElement;
    }
  }

  const nodelist = parent.querySelectorAll("h1, h2, h3, h4, h5, h6, .header");

  nodelist.forEach(node => node.textContent && headers.push(node.textContent));

  headers = [...new Set(headers)];

  if (el?.textContent) {
    headers.push(el.textContent);
  }
  const eventName = headers.join(" ");

  return eventName;
}

function captureMouseEvent(eventBus: EventEmitter<[AppEvent]>, event: React.MouseEvent) {
  const name = getEventName(event.target as HTMLElement);
  const action = capitalize(event.type);

  console.log(`[captureMouseEvent]: ${action} ${name}`);

  eventBus.emit({
    destination: "MixPanel",
    name,
    action: capitalize(event.type),
  });
}

const captureMouseEventInjectable = getInjectable({
  id: "capture-mouse-event",
  instantiate: (di) => {
    return (event: React.MouseEvent) => {
      return captureMouseEvent(di.inject(appEventBusInjectable), event);
    };
  },
});

export default captureMouseEventInjectable;
