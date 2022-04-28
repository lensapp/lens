/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppEvent } from "../../common/app-event-bus/event-bus";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import type { EventEmitter } from "../../common/event-emitter";

// foo_bar-baz => Foo Bar Baz
function getNameFromId(id: string) {
  return id.split(/[/,-,--]/).filter(Boolean).map((part) => `${part[0].toUpperCase()+part.substring(1)}`).join("");
}

function trackWithId(eventBus: EventEmitter<[AppEvent]>, id: string, action: string) {
  const target = getNameFromId(id);

  console.log(`[trackWithId]: ${name}`);

  eventBus.emit({
    name: target,
    action,
    destination: "MixPanel",
  });
}

const trackWithIdInjectable = getInjectable({
  id: "track-with-id",
  instantiate: (di) => {
    return (id: string, action: string) => {
      return trackWithId(di.inject(appEventBusInjectable), id, action);
    };
  },
});

export default trackWithIdInjectable;
