/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppEvent } from "../../../common/app-event-bus/event-bus";
import type { EventEmitter } from "../../../common/event-emitter";
import capitalize from "lodash/capitalize";
import { onClickDecoratorInjectionToken } from "./on-click-decorator-injection-token";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";

function getEventName(el: HTMLElement, pathname: string, parentLevels = 3) {
  let headers: string[] = [];
  let parent = el;

  const path = pathname.split("/");

  headers.push(capitalize(path[path.length-1]));

  for (let i = 0; i < parentLevels; i++) {
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
  const name = getEventName(event.target as HTMLElement, window.location.pathname);

  eventBus.emit({
    name,
    action: capitalize(event.type),
    destination: "AutoCapture",
  });
}


const onClickTelemetryDecoratorInjectable = getInjectable({
  id: "on-click-telemetry-decorator",

  instantiate: (di) => ({
    onClick: (toBeDecorated) => {
      return (event) => {
        captureMouseEvent(di.inject(appEventBusInjectable), event);

        return toBeDecorated(event);
      };
    },
  }),

  injectionToken: onClickDecoratorInjectionToken,
});

export default onClickTelemetryDecoratorInjectable;
