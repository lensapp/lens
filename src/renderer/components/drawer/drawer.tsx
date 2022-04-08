/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer.scss";

import React from "react";
import { clipboard } from "electron";
import { createPortal } from "react-dom";
import type { StorageLayer } from "../../utils";
import { cssNames, noop } from "../../utils";
import { Icon } from "../icon";
import type { AnimateName } from "../animate";
import { Animate } from "../animate";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import drawerStorageInjectable, {
  defaultDrawerWidth,
} from "./drawer-storage/drawer-storage.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import historyInjectable from "../../navigation/history.injectable";
import type { History } from "history";

export type DrawerPosition = "top" | "left" | "right" | "bottom";

export interface DrawerProps {
  open: boolean;
  title: React.ReactNode;

  /**
   * The width or heigh (depending on `position`) of the Drawer.
   *
   * If not set then the Drawer will be resizable.
   */
  size?: string; // e.g. 50%, 500px, etc.
  usePortal?: boolean;
  className?: string | object;
  contentClass?: string | object;
  position?: DrawerPosition;
  animation?: AnimateName;
  onClose?: () => void;
  toolbar?: React.ReactNode;
}

const defaultProps = {
  position: "right",
  animation: "slide-right",
  usePortal: false,
  onClose: noop,
};

interface State {
  isCopied: boolean;
  width: number;
}

export const resizingAnchorProps: Record<DrawerPosition, [ResizeDirection, ResizeSide, ResizeGrowthDirection]> = {
  "right": [ResizeDirection.HORIZONTAL, ResizeSide.LEADING, ResizeGrowthDirection.RIGHT_TO_LEFT],
  "left": [ResizeDirection.HORIZONTAL, ResizeSide.TRAILING, ResizeGrowthDirection.LEFT_TO_RIGHT],
  "top": [ResizeDirection.VERTICAL, ResizeSide.TRAILING, ResizeGrowthDirection.TOP_TO_BOTTOM],
  "bottom": [ResizeDirection.VERTICAL, ResizeSide.LEADING, ResizeGrowthDirection.BOTTOM_TO_TOP],
};

interface Dependencies {
  history: History;
  drawerStorage: StorageLayer<{ width: number }>;
}

class NonInjectedDrawer extends React.Component<DrawerProps & Dependencies & typeof defaultProps, State> {
  static defaultProps = defaultProps as object;

  private mouseDownTarget: HTMLElement | null = null;
  private contentElem: HTMLElement | null = null;
  private scrollElem: HTMLElement | null = null;
  private scrollPos = new Map<string, number>();

  private stopListenLocation = this.props.history.listen(() => {
    this.restoreScrollPos();
  });

  public state = {
    isCopied: false,
    width: this.props.drawerStorage.get().width,
  };

  componentDidMount() {
    // Using window target for events to make sure they will be catched after other places (e.g. Dialog)
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("click", this.onClickOutside);
    window.addEventListener("keydown", this.onEscapeKey);
    window.addEventListener("click", this.fixUpTripleClick);
  }

  componentWillUnmount() {
    this.stopListenLocation();
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("click", this.onClickOutside);
    window.removeEventListener("click", this.fixUpTripleClick);
    window.removeEventListener("keydown", this.onEscapeKey);
  }

  resizeWidth = (width: number) => {
    this.setState({ width });
    this.props.drawerStorage.merge({ width });
  };

  fixUpTripleClick = (ev: MouseEvent) => {
    // detail: A count of consecutive clicks that happened in a short amount of time
    if (ev.detail === 3) {
      const selection = window.getSelection();

      if (selection?.anchorNode?.parentNode) {
        selection.selectAllChildren(selection.anchorNode.parentNode);
      }
    }
  };

  saveScrollPos = () => {
    const key = this.props.history.location.key;

    if (this.scrollElem && key) {
      this.scrollPos.set(key, this.scrollElem.scrollTop);
    }
  };

  restoreScrollPos = () => {
    const key = this.props.history.location.key;

    if (this.scrollElem && key) {
      this.scrollElem.scrollTop = this.scrollPos.get(key) || 0;
    }
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
    const { contentElem, mouseDownTarget, close, props: { open }} = this;

    if (!open || evt.defaultPrevented || contentElem?.contains(mouseDownTarget)) {
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

  copyTitle = (title: string) => {
    const itemName = title.split(":").splice(1).join(":") || title; // copy whole if no :

    clipboard.writeText(itemName.trim());
    this.setState({ isCopied: true });
    setTimeout(() => {
      this.setState({ isCopied: false });
    }, 3000);
  };

  render() {
    const { className, contentClass, animation, open, position, title, children, toolbar, size, usePortal } = this.props;
    const { isCopied, width } = this.state;
    const copyTooltip = isCopied ? "Copied!" : "Copy";
    const copyIcon = isCopied ? "done" : "content_copy";
    const canCopyTitle = typeof title === "string" && title.length > 0;
    const [direction, placement, growthDirection] = resizingAnchorProps[position];
    const drawerSize = size || `${width}px`;

    const drawer = (
      <Animate name={animation} enter={open}>
        <div
          className={cssNames("Drawer", className, position)}
          style={{ "--size": drawerSize } as React.CSSProperties}
          ref={e => this.contentElem = e}
        >
          <div className="drawer-wrapper flex column">
            <div className="drawer-title flex align-center">
              <div className="drawer-title-text flex gaps align-center">
                {title}
                {canCopyTitle && (
                  <Icon
                    material={copyIcon}
                    tooltip={copyTooltip}
                    onClick={() => this.copyTitle(title)}
                  />
                )}
              </div>
              {toolbar}
              <Icon material="close" onClick={this.close}/>
            </div>
            <div
              className={cssNames("drawer-content flex column box grow", contentClass)}
              onScroll={this.saveScrollPos}
              ref={e => this.scrollElem = e}
            >
              {children}
            </div>
          </div>
          {
            !size && (
              <ResizingAnchor
                direction={direction}
                placement={placement}
                growthDirection={growthDirection}
                getCurrentExtent={() => width}
                onDrag={this.resizeWidth}
                onDoubleClick={() => this.resizeWidth(defaultDrawerWidth)}
                minExtent={300}
                maxExtent={window.innerWidth * 0.9}
              />
            )
          }
        </div>
      </Animate>
    );

    return usePortal ? createPortal(drawer, document.body) : drawer;
  }
}

export const Drawer = withInjectables<Dependencies, DrawerProps>(NonInjectedDrawer as never, {
  getProps: (di, props) => ({
    ...props,
    history: di.inject(historyInjectable),
    drawerStorage: di.inject(drawerStorageInjectable),
  }),
});

