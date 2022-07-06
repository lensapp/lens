/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import captureWithIdInjectable from "./capture-with-id.injectable";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { AppEvent } from "../../common/app-event-bus/event-bus";

describe("auto capture with id", () => {
  let emitEvent: (event: AppEvent) => void;
  let capture: (id: string, action: string) => void;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    emitEvent = jest.fn();

    di.override(appEventBusInjectable, () => ({
      emit: emitEvent,
    }));
    capture = di.inject(captureWithIdInjectable);

  });

  it("calls event bus", () => {
    capture("foo_bar-baz", "click");
    expect(emitEvent).toHaveBeenCalledWith({
      name: "Foo Bar Baz",
      action: "click",
      destination: "AutoCapture",
    });
  });
});
