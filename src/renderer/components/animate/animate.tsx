/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./animate.scss";
import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { cssNames, noop } from "../../utils";

export type AnimateName = "opacity" | "slide-right" | "opacity-scale" | string;

export interface AnimateProps {
  name?: AnimateName; // predefined names in css
  enter?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  enterDuration?: number;
  leaveDuration?: number;
}

@observer
export class Animate extends React.Component<AnimateProps> {
  static defaultProps: AnimateProps = {
    name: "opacity",
    enter: true,
    onEnter: noop,
    onLeave: noop,
    enterDuration: 100,
    leaveDuration: 100,
  };

  @observable isVisible = !!this.props.enter;
  @observable statusClassName = {
    enter: false,
    leave: false,
  };

  constructor(props: AnimateProps) {
    super(props);
    makeObservable(this);
  }

  get contentElem() {
    return React.Children.only(this.props.children) as React.ReactElement<React.HTMLAttributes<any>>;
  }

  private toggle(enter: boolean) {
    if (enter) {
      this.enter();
    } else {
      this.leave();
    }
  }

  componentDidMount() {
    this.toggle(this.props.enter);
  }

  componentDidUpdate(prevProps: Readonly<AnimateProps>): void {
    const { enter } = this.props;

    if (prevProps.enter !== enter) {
      this.toggle(enter);
    }
  }

  enter() {
    this.isVisible = true; // triggers render() to apply css-animation in existing dom
    requestAnimationFrame(() => {
      this.statusClassName.enter = true;
      this.props.onEnter();
    });
  }

  leave() {
    if (!this.isVisible) return;
    this.statusClassName.leave = true;
    this.props.onLeave();
    this.resetAfterLeaveDuration();
  }

  resetAfterLeaveDuration() {
    setTimeout(() => this.reset(), this.props.leaveDuration);
  }

  reset() {
    this.isVisible = false;
    this.statusClassName.enter = false;
    this.statusClassName.leave = false;
  }

  render() {
    if (!this.isVisible) {
      return null;
    }

    const { name, enterDuration, leaveDuration } = this.props;
    const contentElem = this.contentElem;
    const cssVarsForAnimation = {
      "--enter-duration": `${enterDuration}ms`,
      "--leave-duration": `${leaveDuration}ms`,
    } as React.CSSProperties;

    return React.cloneElement(contentElem, {
      className: cssNames("Animate", name, contentElem.props.className, this.statusClassName),
      children: contentElem.props.children,
      style: {
        ...contentElem.props.style,
        ...cssVarsForAnimation,
      },
    });
  }
}
