/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shell } from "electron";

const allowedProtocols =  new Set(["http:", "https:"]);

export type OpenLinkInBrowser = (url: string) => Promise<void>;

const openLinkInBrowserInjectable = getInjectable({
  id: "open-link-in-browser",
  instantiate: (): OpenLinkInBrowser => (
    async (url) => {
      const { protocol } = new URL(url);

      if (!allowedProtocols.has(protocol)) {
        throw new TypeError("not an http(s) URL");
      }

      await shell.openExternal(url);
    }
  ),
  causesSideEffects: true,
});

export default openLinkInBrowserInjectable;
