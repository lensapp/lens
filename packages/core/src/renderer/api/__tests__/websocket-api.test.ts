/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

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
    api = new TestWebSocketApi({});
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
