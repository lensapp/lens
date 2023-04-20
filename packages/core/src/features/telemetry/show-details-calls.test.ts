/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { EmitAppEvent } from "../../common/app-event-bus/emit-event.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import type { ShowDetails } from "../../renderer/components/kube-detail-params/show-details.injectable";
import showDetailsInjectable from "../../renderer/components/kube-detail-params/show-details.injectable";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";

describe("emit telemetry with params for calls to showDetails", () => {
  let emitAppEventMock: jest.MockedFunction<EmitAppEvent>;
  let showDetails: ShowDetails;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    emitAppEventMock = jest.fn();
    di.override(emitAppEventInjectable, () => emitAppEventMock);
    showDetails = di.inject(showDetailsInjectable);
  });

  it("when showDetails is called with no selfLink (ie closing) should emit telemetry with param indicating closing the drawer", () => {
    showDetails(undefined);

    expect(emitAppEventMock).toBeCalledWith({
      action: "telemetry-from-business-action",
      destination: "auto-capture",
      name: "show-details",
      params: {
        action: "close",
      },
    });
  });

  it("when showDetails is called with empty selfLink (ie closing) should emit telemetry with param indicating closing the drawer", () => {
    showDetails("");

    expect(emitAppEventMock).toBeCalledWith({
      action: "telemetry-from-business-action",
      destination: "auto-capture",
      name: "show-details",
      params: {
        action: "close",
      },
    });
  });

  it("when showDetails is called with valid selfLink should emit telemetry with param indicating opening the drawer with that resource", () => {
    showDetails("/api/v1/namespaces/default/pods/some-name");

    expect(emitAppEventMock).toBeCalledWith({
      action: "telemetry-from-business-action",
      destination: "auto-capture",
      name: "show-details",
      params: {
        action: "open",
        resource: {
          apiPrefix: "/api",
          apiGroup: "",
          apiVersion: "v1",
          name: "some-name",
          namespace: "default",
          resource: "pods",
        },
      },
    });
  });

  it("when showDetails is called with invalid selfLink should emit telemetry with param indicating opening the drawer but also show error", () => {
    showDetails("some-non-self-link-value");

    expect(emitAppEventMock).toBeCalledWith({
      action: "telemetry-from-business-action",
      destination: "auto-capture",
      name: "show-details",
      params: {
        action: "open",
        error: "invalid apiPath: 'some-non-self-link-value'",
      },
    });
  });
});
