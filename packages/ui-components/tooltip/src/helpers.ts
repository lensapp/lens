/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { iter } from "@k8slens/utilities";
import { TooltipPosition } from "./tooltip";

export type RectangleDimensions = {
  left: number;
  width: number;
  top: number;
  height: number;
  bottom: number;
  right: number;
};

export type FloatingRectangleDimensions = {
  width: number;
  height: number;
};

export type DomElementWithRectangle = {
  getBoundingClientRect: () => RectangleDimensions;
};

export type DomElementWithFloatingRectangle = {
  getBoundingClientRect: () => FloatingRectangleDimensions;
};

export type ComputeNextPositionArgs = {
  tooltip: DomElementWithFloatingRectangle;
  target: DomElementWithRectangle;
  offset: number;
  preferredPositions?: TooltipPosition | TooltipPosition[];
};

export type NextPosition = {
  position: TooltipPosition;
  top: number;
  left: number;
};

type GetPositionArgs = {
  offset: number;
  position: TooltipPosition;
  tooltipBounds: FloatingRectangleDimensions;
  targetBounds: RectangleDimensions;
};

const getPosition = ({ offset, position, tooltipBounds, targetBounds }: GetPositionArgs) => {
  const horizontalCenter = targetBounds.left + (targetBounds.width - tooltipBounds.width) / 2;
  const verticalCenter = targetBounds.top + (targetBounds.height - tooltipBounds.height) / 2;
  const topCenter = targetBounds.top - tooltipBounds.height - offset;
  const bottomCenter = targetBounds.bottom + offset;
  const [left, top] = (() => {
    switch (position) {
      case TooltipPosition.TOP:
        return [horizontalCenter, topCenter];
      case TooltipPosition.BOTTOM:
        return [horizontalCenter, bottomCenter];
      case TooltipPosition.LEFT:
        return [targetBounds.left - tooltipBounds.width - offset, verticalCenter];
      case TooltipPosition.RIGHT:
        return [targetBounds.right + offset, verticalCenter];
      case TooltipPosition.TOP_LEFT:
        return [targetBounds.left, topCenter];
      case TooltipPosition.TOP_RIGHT:
        return [targetBounds.right - tooltipBounds.width, topCenter];
      case TooltipPosition.BOTTOM_LEFT:
        return [targetBounds.left, bottomCenter];
      case TooltipPosition.BOTTOM_RIGHT:
        return [targetBounds.right - tooltipBounds.width, bottomCenter];
    }
  })();

  return {
    left,
    top,
    right: left + tooltipBounds.width,
    bottom: top + tooltipBounds.height,
  };
};

const isTooltipPosition = (value: unknown): value is TooltipPosition =>
  Object.values(TooltipPosition).includes(value as TooltipPosition);

export const computeNextPosition = ({
  offset,
  preferredPositions,
  target,
  tooltip,
}: ComputeNextPositionArgs): NextPosition => {
  const positions = new Set<TooltipPosition>([
    ...[preferredPositions ?? []].filter(isTooltipPosition).flat(),
    TooltipPosition.RIGHT,
    TooltipPosition.BOTTOM,
    TooltipPosition.TOP,
    TooltipPosition.LEFT,
    TooltipPosition.TOP_RIGHT,
    TooltipPosition.TOP_LEFT,
    TooltipPosition.BOTTOM_RIGHT,
    TooltipPosition.BOTTOM_LEFT,
  ]);

  const tooltipBounds = tooltip.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();
  const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

  // find proper position
  for (const position of positions) {
    const { left, top, right, bottom } = getPosition({
      offset,
      position,
      tooltipBounds,
      targetBounds,
    });
    const fitsToWindow = left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;

    if (fitsToWindow) {
      return {
        left,
        top,
        position,
      };
    }
  }

  const position = iter.first(positions) as TooltipPosition;

  return {
    position,
    ...getPosition({
      offset,
      position,
      tooltipBounds,
      targetBounds,
    }),
  };
};
