import "./animate.scss";
import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { autobind, cssNames, noop } from "../../utils";

export type AnimateName = "opacity" | "slide-right" | "opacity-scale" | string;

export interface AnimateProps {
  name?: AnimateName; // predefined names in css
  enter?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}

@observer
export class Animate extends React.Component<AnimateProps> {
  static VISIBILITY_DELAY_MS = 0;

  static defaultProps: AnimateProps = {
    name: "opacity",
    enter: true,
    onEnter: noop,
    onLeave: noop,
  };

  @observable isVisible = !!this.props.enter;
  @observable statusClassName = {
    enter: false,
    leave: false
  };

  get contentElem() {
    return React.Children.only(this.props.children) as React.ReactElement<React.HTMLAttributes<any>>;
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.enter, enter => {
        if (enter) this.enter();
        else this.leave();
      }, {
        delay: Animate.VISIBILITY_DELAY_MS,
        fireImmediately: true,
      })
    ])
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
  }

  reset() {
    this.isVisible = false;
    this.statusClassName.enter = false;
    this.statusClassName.leave = false;
  }

  @autobind()
  onTransitionEnd(evt: React.TransitionEvent) {
    const { enter, leave } = this.statusClassName;
    const { onTransitionEnd } = this.contentElem.props;
    if (onTransitionEnd) onTransitionEnd(evt);
    // todo: check evt.propertyName and make sure all animating props has finished their transition
    if (enter && leave) {
      this.reset();
    }
  }

  render() {
    const { name } = this.props;
    const contentElem = this.contentElem;
    return React.cloneElement(contentElem, {
      className: cssNames("Animate", name, contentElem.props.className, this.statusClassName),
      children: this.isVisible ? contentElem.props.children : null,
      onTransitionEnd: this.onTransitionEnd,
    });
  }
}
