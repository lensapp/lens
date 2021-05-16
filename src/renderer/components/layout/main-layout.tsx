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

import "./main-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import { getHostedCluster } from "../../../common/cluster-store";
import { cssNames } from "../../utils";
import { Dock } from "../dock";
import { ErrorBoundary } from "../error-boundary";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import { MainLayoutHeader } from "./main-layout-header";
import { Sidebar } from "./sidebar";
import { sidebarStorage } from "./sidebar-storage";

export interface MainLayoutProps {
  className?: any;
  footer?: React.ReactNode;
  headerClass?: string;
  footerClass?: string;
}

@observer
export class MainLayout extends React.Component<MainLayoutProps> {
  onSidebarCompactModeChange = () => {
    sidebarStorage.merge(draft => {
      draft.compact = !draft.compact;
    });
  };

  onSidebarResize = (width: number) => {
    sidebarStorage.merge({ width });
  };

  render() {
    const cluster = getHostedCluster();
    const { onSidebarCompactModeChange, onSidebarResize } = this;
    const { className, headerClass, footer, footerClass, children } = this.props;
    const { compact, width: sidebarWidth } = sidebarStorage.get();
    const style = { "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties;

    if (!cluster) {
      return null; // fix: skip render when removing active (visible) cluster
    }

    return (
      <div className={cssNames("MainLayout", className)} style={style}>
        <MainLayoutHeader className={headerClass} cluster={cluster}/>

        <aside className={cssNames("flex column", { compact })}>
          <Sidebar className="box grow" compact={compact} toggle={onSidebarCompactModeChange}/>
          <ResizingAnchor
            direction={ResizeDirection.HORIZONTAL}
            placement={ResizeSide.TRAILING}
            growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
            getCurrentExtent={() => sidebarWidth}
            onDrag={onSidebarResize}
            onDoubleClick={onSidebarCompactModeChange}
            disabled={compact}
            minExtent={120}
            maxExtent={400}
          />
        </aside>

        <main>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <footer className={footerClass}>{footer ?? <Dock/>}</footer>
      </div>
    );
  }
}
