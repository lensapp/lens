/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "@k8slens/test-utils";
import EventEmitter from "events";
import lensProxyHttpsServerInjectable from "./server.injectable";

export default getGlobalOverride(lensProxyHttpsServerInjectable, () => new class extends EventEmitter {
  close() { }
  listen() {
    this.emit("listening");
  }
  address() {
    return {
      address: "https://localhost:9090",
      port: 9090,
      family: "some-family",
    };
  }
});
