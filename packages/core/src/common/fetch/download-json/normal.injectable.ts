/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fetchInjectable from "../fetch.injectable";
import { downloadJsonWith } from "./impl";

const downloadJsonInjectable = getInjectable({
  id: "download-json",
  instantiate: (di) => downloadJsonWith(di.inject(fetchInjectable)),
});

export default downloadJsonInjectable;
