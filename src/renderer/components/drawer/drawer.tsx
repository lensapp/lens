/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer.scss";

import React, { useEffect, useRef, useState } from "react";
import { clipboard } from "electron";
import { createPortal } from "react-dom";
import { cssNames, disposer, Disposer, noop, StorageLayer } from "../../utils";
import { Icon } from "../icon";
import { Animate, AnimateName } from "../animate";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import drawerStorageInjectable, { defaultDrawerWidth, DrawerState } from "./storage.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import addWindowEventListenerInjectable from "../../event-listeners/add-window-event-listener.injectable";
import { observable } from "mobx";
import historyInjectable from "../../navigation/history.injectable";
import type { History } from "history";

export type DrawerPosition = "top" | "left" | "right" | "bottom";

const resizingAnchorProps = new Map<DrawerPosition, [ResizeDirection, ResizeSide, ResizeGrowthDirection]>();

resizingAnchorProps.set("right", [ResizeDirection.HORIZONTAL, ResizeSide.LEADING, ResizeGrowthDirection.RIGHT_TO_LEFT]);
resizingAnchorProps.set("left", [ResizeDirection.HORIZONTAL, ResizeSide.TRAILING, ResizeGrowthDirection.LEFT_TO_RIGHT]);
resizingAnchorProps.set("top", [ResizeDirection.VERTICAL, ResizeSide.TRAILING, ResizeGrowthDirection.TOP_TO_BOTTOM]);
resizingAnchorProps.set("bottom", [ResizeDirection.VERTICAL, ResizeSide.LEADING, ResizeGrowthDirection.BOTTOM_TO_TOP]);

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
  children?: React.ReactChild | React.ReactChild[];
}

interface Dependencies {
  history: History;
  state: StorageLayer<DrawerState>;
  addWindowEventListener: <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) => Disposer;
}

const NonInjectedDrawer = observer(({
  history,
  state,
  addWindowEventListener,
  className,
  contentClass,
  animation = "slide-right",
  open,
  position = "right",
  title,
  children,
  toolbar,
  size,
  usePortal = false,
  onClose = noop,
}: Dependencies & DrawerProps) => {
  const contentElem = useRef<HTMLDivElement | undefined>();
  const scrollElem = useRef<HTMLDivElement | undefined>();
  const [mouseDownTarget, setMouseDownTarget] = useState<HTMLElement | undefined>();
  const [isCopied, setIsCopied] = useState(false);
  const [scrollPos] = useState(observable.map<string, number>());
  const { width } = state.get();

  const resizeWidth = (width: number) => {
    state.merge({ width });
  };

  const fixUpTripleClick = (ev: MouseEvent) => {
    // detail: A count of consecutive clicks that happened in a short amount of time
    if (ev.detail === 3) {
      const selection = window.getSelection();

      selection.selectAllChildren(selection.anchorNode?.parentNode);
    }
  };

  const saveScrollPos = () => {
    if (scrollElem.current) {
      const { key } = history.location;

      scrollPos.set(key, scrollElem.current.scrollTop);
    }
  };

  const restoreScrollPos = () => {
    if (scrollElem.current) {
      const { key } = history.location;

      scrollElem.current.scrollTop = scrollPos.get(key) || 0;
    }
  };

  const onEscapeKey = (evt: KeyboardEvent) => {
    if (!open) {
      return;
    }

    if (evt.code === "Escape") {
      close();
    }
  };

  const onClickOutside = (evt: MouseEvent) => {
    if (!open || evt.defaultPrevented || contentElem.current.contains(mouseDownTarget)) {
      return;
    }

    const clickedElem = evt.target as HTMLElement;
    const isOutsideAnyDrawer = !clickedElem.closest(".Drawer");

    if (isOutsideAnyDrawer) {
      close();
    }
    setMouseDownTarget(undefined);
  };

  const onMouseDown = (evt: MouseEvent) => {
    if (open) {
      setMouseDownTarget(evt.target as HTMLElement);
    }
  };

  const close = () => {
    if (open) {
      onClose();
    }
  };

  const copyTitle = (title: string) => {
    const itemName = title.split(":").splice(1).join(":") || title; // copy whole if no :

    clipboard.writeText(itemName.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  useEffect(() => disposer(
    history.listen(restoreScrollPos),
    addWindowEventListener("mousedown", onMouseDown),
    addWindowEventListener("click", onClickOutside),
    addWindowEventListener("keydown", onEscapeKey),
    addWindowEventListener("click", fixUpTripleClick),
  ), []);

  const copyTooltip = isCopied ? "Copied!" : "Copy";
  const copyIcon = isCopied ? "done" : "content_copy";
  const canCopyTitle = typeof title === "string" && title.length > 0;
  const [direction, placement, growthDirection] = resizingAnchorProps.get(position);
  const drawerSize = size || `${width}px`;

  const drawer = (
    <Animate name={animation} enter={open}>
      <div
        className={cssNames("Drawer", className, position)}
        style={{ "--size": drawerSize } as React.CSSProperties}
        ref={contentElem}
      >
        <div className="drawer-wrapper flex column">
          <div className="drawer-title flex align-center">
            <div className="drawer-title-text flex gaps align-center">
              {title}
              {canCopyTitle && (
                <Icon material={copyIcon} tooltip={copyTooltip} onClick={() => copyTitle(title)}/>
              )}
            </div>
            {toolbar}
            <Icon material="close" onClick={close}/>
          </div>
          <div
            className={cssNames("drawer-content flex column box grow", contentClass)}
            onScroll={saveScrollPos}
            ref={scrollElem}
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
              onDrag={resizeWidth}
              onDoubleClick={() => resizeWidth(defaultDrawerWidth)}
              minExtent={300}
              maxExtent={window.innerWidth * 0.9}
            />
          )
        }
      </div>
    </Animate>
  );

  return usePortal ? createPortal(drawer, document.body) : drawer;
});

export const Drawer = withInjectables<Dependencies, DrawerProps>(NonInjectedDrawer, {
  getProps: (di, props) => ({
    history: di.inject(historyInjectable),
    state: di.inject(drawerStorageInjectable),
    addWindowEventListener: di.inject(addWindowEventListenerInjectable),
    ...props,
  }),
});
