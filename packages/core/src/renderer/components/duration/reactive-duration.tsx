/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import { formatDuration } from "@k8slens/utilities";
import { reactiveNow } from "../../../common/utils/reactive-now/reactive-now";

export interface ReactiveDurationProps {
  timestamp: string | undefined;

  /**
   * Whether the display string should prefer length over precision
   * @default true
   */
  compact?: boolean;
}

const everySecond = 1000;
const everyMinute = 60 * 1000;

/**
 * This function computes a reasonable update interval, matching `formatDuration`'s rules on when to display seconds
 */
function computeUpdateInterval(creationTimestampEpoch: number, compact: boolean): number {
  const seconds = Math.floor((Date.now() - creationTimestampEpoch) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 10) {
    return everySecond;
  }

  if (compact) {
    return everyMinute;
  }

  if (minutes < (60 * 3)) {
    return everySecond;
  }

  return everyMinute;
}

export const ReactiveDuration = observer(({ timestamp, compact = true }: ReactiveDurationProps) => {
  if (!timestamp) {
    return <>{"<unknown>"}</>;
  }

  const timestampSeconds = new Date(timestamp).getTime();

  return (
    <>
      {formatDuration(reactiveNow(computeUpdateInterval(timestampSeconds, compact)) - timestampSeconds, compact)}
    </>
  );
});
