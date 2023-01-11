/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import proxyFetchInjectable from "../proxy-fetch.injectable";
import { downloadJsonWith } from "./impl";

const proxyDownloadJsonInjectable = getInjectable({
  id: "proxy-download-json",
  instantiate: (di) => downloadJsonWith(di.inject(proxyFetchInjectable)),
});

export default proxyDownloadJsonInjectable;
