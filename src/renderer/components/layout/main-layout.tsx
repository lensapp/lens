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
