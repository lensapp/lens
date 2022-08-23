/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

export const withTooltip =
  (Target: any) =>
    ({ tooltip, tooltipOverrideDisabled, ...props }: any) => {
      if (tooltip) {
        const testId = props["data-testid"];

        return (
          <>
            <Target {...props} />
            <div data-testid={testId && `tooltip-content-for-${testId}`}>
              {tooltip.children || tooltip}
            </div>
          </>
        );
      }

      return <Target {...props} />;
    };
