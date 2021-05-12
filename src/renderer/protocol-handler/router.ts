/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ipcRenderer } from "electron";
import * as proto from "../../common/protocol-handler";
import logger from "../../main/logger";
import Url from "url-parse";
import { boundMethod } from "../utils";

export class LensProtocolRouterRenderer extends proto.LensProtocolRouter {
  /**
   * This function is needed to be called early on in the renderers lifetime.
   */
  public init(): void {
    ipcRenderer
      .on(proto.ProtocolHandlerInternal, this.ipcInternalHandler)
      .on(proto.ProtocolHandlerExtension, this.ipcExtensionHandler);
  }

  @boundMethod
  private ipcInternalHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    const [rawUrl] = args;
    const url = new Url(rawUrl, true);

    this._routeToInternal(url);
  }

  @boundMethod
  private ipcExtensionHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    const [rawUrl] = args;
    const url = new Url(rawUrl, true);

    this._routeToExtension(url);
  }
}
