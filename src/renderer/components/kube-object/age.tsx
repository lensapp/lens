/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ReactiveDuration } from "../duration/reactive-duration";

export interface KubeObjectAgeProps {
  object: {
    metadata: {
      creationTimestamp?: string;
    };
  };

  /**
   * Whether the display string should prefer length over precision
   * @default true
   */
  compact?: boolean;
}

export const KubeObjectAge = ({ object, compact = true }: KubeObjectAgeProps) => (
  object.metadata.creationTimestamp
    ? (
      <ReactiveDuration
        timestamp={object.metadata.creationTimestamp}
        compact={compact}
      />
    )
    : <>{"<unknown>"}</>
);
