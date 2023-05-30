/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./animate.scss";
import React, { useEffect, useState } from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames, noop } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { RequestAnimationFrame } from "./request-animation-frame.injectable";
import { requestAnimationFrameInjectable } from "./request-animation-frame.injectable";
import { defaultEnterDurationForAnimatedInjectable } from "./default-enter-duration.injectable";
import { defaultLeaveDurationForAnimatedInjectable } from "./default-leave-duration.injectable";

export type AnimateName = "opacity" | "slide-right" | "opacity-scale" | string;

export interface AnimateProps {
  name?: AnimateName; // predefined names in css
  enter?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  enterDuration?: number;
  leaveDuration?: number;
  children?: StrictReactNode;
}

interface Dependencies {
  requestAnimationFrame: RequestAnimationFrame;
  defaultEnterDuration: number;
  defaultLeaveDuration: number;
}

const NonInjectedAnimate = (propsAndDeps: AnimateProps & Dependencies) => {
  const { requestAnimationFrame, defaultEnterDuration, defaultLeaveDuration, ...props } = propsAndDeps;
  const {
    children,
    enter = true,
    enterDuration = defaultEnterDuration,
    leaveDuration = defaultLeaveDuration,
    name = "opacity",
    onEnter: onEnterHandler = noop<[]>,
    onLeave: onLeaveHandler = noop<[]>,
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [showClassNameEnter, setShowClassNameEnter] = useState(false);
  const [showClassNameLeave, setShowClassNameLeave] = useState(false);

  // eslint-disable-next-line xss/no-mixed-html
  const contentElem = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<any>>;
  const classNames = cssNames("Animate", name, contentElem.props.className, {
    enter: showClassNameEnter,
    leave: showClassNameLeave,
  });

  useEffect(() => {
    if (enter) {
      setIsVisible(true);

      requestAnimationFrame(() => {
        setShowClassNameEnter(true);
        onEnterHandler();
      });

      return noop;
    } else if (isVisible) {
      setShowClassNameLeave(true);
      onLeaveHandler();

      // Cleanup after duration
      const handle = setTimeout(() => {
        setIsVisible(false);
        setShowClassNameEnter(false);
        setShowClassNameLeave(false);
      }, leaveDuration);

      return () => clearTimeout(handle);
    }

    return noop;
  }, [enter]);

  if (!isVisible) {
    return null;
  }

  const cssVarsForAnimation = {
    "--enter-duration": `${enterDuration}ms`,
    "--leave-duration": `${leaveDuration}ms`,
  } as React.CSSProperties;

  return React.cloneElement(contentElem, {
    className: classNames,
    children: contentElem.props.children,
    style: {
      ...contentElem.props.style,
      ...cssVarsForAnimation,
    },
  });
};

export const Animate = withInjectables<Dependencies, AnimateProps>(NonInjectedAnimate, {
  getProps: (di, props) => ({
    ...props,
    requestAnimationFrame: di.inject(requestAnimationFrameInjectable),
    defaultEnterDuration: di.inject(defaultEnterDurationForAnimatedInjectable),
    defaultLeaveDuration: di.inject(defaultLeaveDurationForAnimatedInjectable),
  }),
});
