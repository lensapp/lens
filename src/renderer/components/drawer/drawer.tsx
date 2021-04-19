import "./drawer.scss";

import React from "react";
import { createPortal } from "react-dom";
import { cssNames, noop } from "../../utils";
import { Animate, AnimateName } from "../animate";
import { history } from "../../navigation";
import { MenuEntry, RootMenuEntry } from "../../descriptors";
import { computed } from "mobx";
import { Close } from "@material-ui/icons";
import { IconButton, Tooltip } from "@material-ui/core";

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
  toolbarMenuEntries?: RootMenuEntry[];
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

  @computed get toolbarMenuEntries(): RootMenuEntry[] {
    return [...(this.props.toolbarMenuEntries ?? []), {
      Icon: Close,
      text: "Close",
      onClick: () => this.close(),
    }];
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

  renderToolbarMenu() {
    return (this.toolbarMenuEntries as MenuEntry[]).map(({ Icon, onClick, text, closeParent }) => (
      <Tooltip key={text} title={text}>
        <IconButton onClick={() => {
          onClick();

          if (closeParent) {
            this.close();
          }
        }}>
          <Icon />
        </IconButton>
      </Tooltip>
    ));
  }

  render() {
    const { open, position, title, animation, children, size, usePortal } = this.props;
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
              {this.renderToolbarMenu()}
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
