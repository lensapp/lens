/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AppEvent } from "../app-event-bus/event-bus";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import appEventBusInjectable from "../app-event-bus/app-event-bus.injectable";
import type { EventEmitter } from "../event-emitter";

describe("event bus tests", () => {
  let appEventBus: EventEmitter<[AppEvent]>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    appEventBus = di.inject(appEventBusInjectable);
  });

  describe("emit", () => {
    it("emits an event", () => {
      let event!: AppEvent;

      appEventBus.addListener((data) => {
        event = data;
      });

      appEventBus.emit({ name: "foo", action: "bar" });
      expect(event.name).toBe("foo");
    });
  });
});
