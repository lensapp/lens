/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { AppEvent } from "../../common/app-event-bus/event-bus";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import type { EventEmitter } from "../../common/event-emitter";

function getButtonEventName(el: HTMLElement) {
  let headers: string[] = [];
  const levels = 3;
  let parent = el;

  for (let i = 0; i < levels; i++) {
    if (parent.parentElement) {
      parent = parent.parentElement;
    }
  }

  const nodelist = parent.querySelectorAll("h1, h2, h3, h4, h5, h6, .header");

  nodelist.forEach(node => headers.push(node.textContent));

  if (headers.length === 0) {
    const path = window.location.pathname.split("/");

    headers.push(path[path.length-1]);
  }

  headers = [...new Set(headers)];
  headers.push(el.textContent);
  const buttonEventName = headers.join(" ");

  return buttonEventName;
}

// foo_bar-baz => Foo Bar Baz
function getNameFromId(id: string) {
  return id.split(/[_,-]/).map((part) => `${part[0].toUpperCase()+part.substring(1)}`).join("");
}

export class Telemetry {
  private eventBus: EventEmitter<[AppEvent]>;
  private destination = "jep";
  private debug = false;

  constructor(eventBus: EventEmitter<[AppEvent]>) {
    this.eventBus = eventBus;
  }

  private emitEvent(action: string, name: string) {
    console.log(`[TELEMETRY]: ${action} ${name}`);

    if (!this.debug) {
      this.eventBus.emit({
        destination: this.destination,
        name,
        action,
      });
    }
  }

  buttonClickEvent(e: React.MouseEvent) {
    const el = e.target as HTMLElement;

    this.emitEvent("Click", getButtonEventName(el));
  }

  selectChangeEvent(id: string) {
    this.emitEvent("Select Change", getNameFromId(id));
  }

  tableRowClick(id: string) {
    this.emitEvent("Table Row Click", getNameFromId(id));
  }
}

const telemetryInjectable = getInjectable({
  id: "telemetry",
  instantiate: (di) => new Telemetry(di.inject(appEventBusInjectable)),
});

export default telemetryInjectable;
