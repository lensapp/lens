/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Tooltip decorator for simple composition with other components

import type { ReactNode } from "react";
import React, { useState } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import type { TooltipProps } from "./tooltip";
import { Tooltip } from "./tooltip";
import { isReactNode } from "../../utils/isReactNode";
import uniqueId from "lodash/uniqueId";
import type { SingleOrMany } from "../../utils";

export interface TooltipDecoratorProps {
  tooltip?: ReactNode | Omit<TooltipProps, "targetId">;
  /**
   * forces tooltip to detect the target's parent for mouse events. This is
   * useful for displaying tooltips even when the target is "disabled"
   */
  tooltipOverrideDisabled?: boolean;
  id?: string | undefined;
  children?: SingleOrMany<React.ReactNode>;
}

export function withTooltip<TargetProps extends Pick<TooltipDecoratorProps, "id" | "children">>(Target: React.FunctionComponent<TargetProps>): React.FunctionComponent<TargetProps & TooltipDecoratorProps> {
  const DecoratedComponent = (props: TargetProps & TooltipDecoratorProps) => {
    // TODO: Remove side-effect to allow deterministic unit testing
    const [defaultTooltipId] = useState(uniqueId("tooltip_target_"));

    let {
      id: targetId,
      children: targetChildren,
    } = props;
    const {
      tooltip,
      tooltipOverrideDisabled,
      id: _unusedId,
      children: _unusedTargetChildren,
      ...targetProps
    } = props;

    if (tooltip) {
      const tooltipProps: TooltipProps = {
        targetId: targetId || defaultTooltipId,
        tooltipOnParentHover: tooltipOverrideDisabled,
        formatters: { narrow: true },
        ...(isReactNode(tooltip) ? { children: tooltip } : tooltip),
      };

      targetId = tooltipProps.targetId;
      targetChildren = (
        <>
          <div>
            {targetChildren}
          </div>
          <Tooltip {...tooltipProps} />
        </>
      );
    }

    return (
      <Target id={targetId} {...targetProps as TargetProps}>
        {targetChildren}
      </Target>
    );
  };

  DecoratedComponent.displayName = `withTooltip(${Target.displayName || Target.name})`;

  return hoistNonReactStatics(DecoratedComponent, Target);
}
