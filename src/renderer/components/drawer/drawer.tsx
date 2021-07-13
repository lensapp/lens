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

import "./drawer.scss";

import React from "react";
import { createPortal } from "react-dom";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import { Animate, AnimateName } from "../animate";
import { history } from "../../navigation";

export interface DrawerProps {
  open: boolean;
  title: React.ReactNode;
  size?: string; // e.g. 50%, 500px, etc.
  usePortal?: boolean;
  className?: string | object;
  contentClass?: string | object;
  position?: "top" | "left" | "right" | "bottom";
  animation?: AnimateName;
  onClose?: () => void;
  toolbar?: React.ReactNode;
}

const defaultProps: Partial<DrawerProps> = {
  position: "right",
  animation: "slide-right",
  usePortal: false,
  onClose: noop,
};

export class Drawer extends React.Component<DrawerProps> {
  static defaultProps = defaultProps as object;

  private mouseDownTarget: HTMLElement;
  private contentElem: HTMLElement;
  private scrollElem: HTMLElement;
  private scrollPos = new Map<string, number>();

  private stopListenLocation = history.listen(() => {
    this.restoreScrollPos();
  });

  componentDidMount() {
    // Using window target for events to make sure they will be catched after other places (e.g. Dialog)
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("click", this.onClickOutside);
    window.addEventListener("keydown", this.onEscapeKey);
  }

  componentWillUnmount() {
    this.stopListenLocation();
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("click", this.onClickOutside);
    window.removeEventListener("keydown", this.onEscapeKey);
  }

  saveScrollPos = () => {
    if (!this.scrollElem) return;
    const key = history.location.key;

    this.scrollPos.set(key, this.scrollElem.scrollTop);
  };

  restoreScrollPos = () => {
    if (!this.scrollElem) return;
    const key = history.location.key;

    this.scrollElem.scrollTop = this.scrollPos.get(key) || 0;
  };

  onEscapeKey = (evt: KeyboardEvent) => {
    if (!this.props.open) {
      return;
    }

    if (evt.code === "Escape") {
      this.close();
    }
  };

  onClickOutside = (evt: MouseEvent) => {
    const { contentElem, mouseDownTarget, close, props: { open } } = this;

    if (!open || evt.defaultPrevented || contentElem.contains(mouseDownTarget)) {
      return;
    }
    const clickedElem = evt.target as HTMLElement;
    const isOutsideAnyDrawer = !clickedElem.closest(".Drawer");

    if (isOutsideAnyDrawer) {
      close();
    }
    this.mouseDownTarget = null;
  };

  onMouseDown = (evt: MouseEvent) => {
    if (this.props.open) {
      this.mouseDownTarget = evt.target as HTMLElement;
    }
  };

  close = () => {
    const { open, onClose } = this.props;

    if (open) onClose();
  };

  render() {
    const { open, position, title, animation, children, toolbar, size, usePortal } = this.props;
    let { className, contentClass } = this.props;

    className = cssNames("Drawer", className, position);
    contentClass = cssNames("drawer-content flex column box grow", contentClass);
    const style = size ? { "--size": size } as React.CSSProperties : undefined;
    const drawer = (
      <Animate name={animation} enter={open}>
        <div className={className} style={style} ref={e => this.contentElem = e}>
          <div className="drawer-wrapper flex column">
            <div className="drawer-title flex align-center">
              <div className="drawer-title-text">{title}</div>
              {toolbar}
              <Icon material="close" onClick={this.close}/>
            </div>
            <div className={contentClass} onScroll={this.saveScrollPos} ref={e => this.scrollElem = e}>
              {children}
            </div>
          </div>
        </div>
      </Animate>
    );

    return usePortal ? createPortal(drawer, document.body) : drawer;
  }
}
