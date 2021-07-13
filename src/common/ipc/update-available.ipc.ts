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

import type { UpdateInfo } from "electron-updater";

export const UpdateAvailableChannel = "update-available";
export const AutoUpdateLogPrefix = "[UPDATE-CHECKER]";

export type UpdateAvailableFromMain = [backChannel: string, updateInfo: UpdateInfo];

export function areArgsUpdateAvailableFromMain(args: unknown[]): args is UpdateAvailableFromMain {
  if (args.length !== 2) {
    return false;
  }

  if (typeof args[0] !== "string") {
    return false;
  }

  if (typeof args[1] !== "object" || args[1] === null) {
    // TODO: improve this checking
    return false;
  }

  return true;
}

export type BackchannelArg = {
  doUpdate: false;
} | {
  doUpdate: true;
  now: boolean;
};

export type UpdateAvailableToBackchannel = [updateDecision: BackchannelArg];

export function areArgsUpdateAvailableToBackchannel(args: unknown[]): args is UpdateAvailableToBackchannel {
  if (args.length !== 1) {
    return false;
  }

  if (typeof args[0] !== "object" || args[0] === null) {
    // TODO: improve this checking
    return false;
  }

  return true;
}
