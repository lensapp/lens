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
