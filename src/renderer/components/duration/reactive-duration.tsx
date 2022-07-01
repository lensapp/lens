/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import { formatDuration } from "../../utils";
import { reactiveNow } from "../../../common/utils/reactive-now/reactive-now";

export interface ReactiveDurationProps {
  timestamp: string | undefined;

  /**
   * Whether the display string should prefer length over precision
   * @default true
   */
  compact?: boolean;
}

/**
 * This function computes a resonable update
 */
function computeUpdateInterval(creationTimestampEpoch: number): number {
  const seconds = Math.floor((Date.now() - creationTimestampEpoch) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 10) {
    // Update every second
    return 1000;
  }

  return 60 * 1000;
}

export const ReactiveDuration = observer(({ timestamp, compact = true }: ReactiveDurationProps) => {
  if (!timestamp) {
    return <>{"<unknown>"}</>;
  }

  const timestampSeconds = new Date(timestamp).getTime();

  return (
    <>
      {formatDuration(reactiveNow(computeUpdateInterval(timestampSeconds)) - timestampSeconds, compact)}
    </>
  );
});
