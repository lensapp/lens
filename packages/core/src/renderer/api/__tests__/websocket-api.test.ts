/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import defaultWebsocketApiParamsInjectable from "../default-websocket-api-params.injectable";
import type { WebSocketEvents } from "../websocket-api";
import { WebSocketApi } from "../websocket-api";

class TestWebSocketApi extends WebSocketApi<WebSocketEvents> {
  flush(): void {
    super.flush();
  }
}

describe("WebsocketApi tests", () => {
  let api: TestWebSocketApi;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    api = new TestWebSocketApi({
      defaultParams: di.inject(defaultWebsocketApiParamsInjectable),
    }, {});
  });

  describe("before connection", () => {
    it("does not hang when flush is called", () => {
      api.flush();
    });

    describe("when a message has been sent", () => {
      beforeEach(() => {
        api.send("a command");
      });

      it("does not hang when flush is called", () => {
        api.flush();
      });
    });
  });
});
