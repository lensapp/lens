/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { _isComputingDerivation } from "mobx";
import type { IResource } from "mobx-utils";
import { fromResource } from "mobx-utils";

// Note: This file is copy-pasted from mobx-utils to fix very specific issue.
// TODO: Remove this file once https://github.com/mobxjs/mobx-utils/issues/306 is fixed.
const tickers: Record<number|string, IResource<number>> = {};

export function reactiveNow(interval?: number | "frame") {
  if (interval === void 0) { interval = 1000; }

  if (!_isComputingDerivation()) {
    // See #40
    return Date.now();
  }

  // Note: This is the kludge until https://github.com/mobxjs/mobx-utils/issues/306 is fixed
  const synchronizationIsEnabled = !process.env.JEST_WORKER_ID;

  if (!tickers[interval] || !synchronizationIsEnabled) {
    if (typeof interval === "number")
      tickers[interval] = createIntervalTicker(interval);
    else
      tickers[interval] = createAnimationFrameTicker();
  }

  return tickers[interval].current();
}

function createIntervalTicker(interval: number) {
  let subscriptionHandle: NodeJS.Timer;

  return fromResource(function (sink) {
    sink(Date.now());
    subscriptionHandle = setInterval(function () { return sink(Date.now()); }, interval);
  }, function () {
    clearInterval(subscriptionHandle);
  }, Date.now());
}

function createAnimationFrameTicker() {
  const frameBasedTicker = fromResource(function (sink) {
    sink(Date.now());

    function scheduleTick() {
      window.requestAnimationFrame(function () {
        sink(Date.now());
        if (frameBasedTicker.isAlive())
          scheduleTick();
      });
    }
    scheduleTick();
  }, function () { }, Date.now());

  return frameBasedTicker;
}
