/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { shell } from "electron";

const allowedProtocols =  new Set(["http:", "https:"]);

/**
 * Opens a link using the program configured as the default browser
 * on the target platform. Will reject URLs with a scheme other than
 * http or https to prevent programs other than the default browser
 * running.
 *
 * @param url The URL to open
 */
export function openBrowser(url: string): Promise<void> {
  if (allowedProtocols.has(new URL(url).protocol)) {
    return shell.openExternal(url);
  }

  return Promise.reject(new TypeError("not an http(s) URL"));
}

/**
 * @deprecated use openBrowser
 */
export const openExternal = openBrowser;
