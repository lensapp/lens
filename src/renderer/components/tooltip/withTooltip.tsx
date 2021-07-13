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

// Tooltip decorator for simple composition with other components

import React, { HTMLAttributes, ReactNode } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Tooltip, TooltipProps } from "./tooltip";
import { isReactNode } from "../../utils/isReactNode";
import uniqueId from "lodash/uniqueId";

export interface TooltipDecoratorProps {
  tooltip?: ReactNode | Omit<TooltipProps, "targetId">;
  /**
   * forces tooltip to detect the target's parent for mouse events. This is
   * useful for displaying tooltips even when the target is "disabled"
   */
  tooltipOverrideDisabled?: boolean;
}

export function withTooltip<T extends React.ComponentType<any>>(Target: T): T {
  const DecoratedComponent = class extends React.Component<HTMLAttributes<any> & TooltipDecoratorProps> {
    static displayName = `withTooltip(${Target.displayName || Target.name})`;

    protected tooltipId = uniqueId("tooltip_target_");

    render() {
      const { tooltip, tooltipOverrideDisabled, ...targetProps } = this.props;

      if (tooltip) {
        const tooltipId = targetProps.id || this.tooltipId;
        const tooltipProps: TooltipProps = {
          targetId: tooltipId,
          tooltipOnParentHover: tooltipOverrideDisabled,
          formatters: { narrow: true },
          ...(isReactNode(tooltip) ? { children: tooltip } : tooltip),
        };

        targetProps.id = tooltipId;
        targetProps.children = (
          <>
            <div>
              {targetProps.children}
            </div>
            <Tooltip {...tooltipProps} />
          </>
        );
      }

      return <Target {...targetProps as any} />;
    }
  };

  return hoistNonReactStatics(DecoratedComponent, Target) as any;
}
