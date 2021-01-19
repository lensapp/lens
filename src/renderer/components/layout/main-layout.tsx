import "./main-layout.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { getHostedCluster } from "../../../common/cluster-store";
import { autobind, createStorage, cssNames } from "../../utils";
import { Dock } from "../dock";
import { ErrorBoundary } from "../error-boundary";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import { MainLayoutHeader } from "./main-layout-header";
import { Sidebar } from "./sidebar";

export interface MainLayoutProps {
  className?: any;
  footer?: React.ReactNode;
  headerClass?: string;
  footerClass?: string;
}

@observer
export class MainLayout extends React.Component<MainLayoutProps> {
  public storage = createStorage("main_layout", {
    pinnedSidebar: true,
    sidebarWidth: 200,
  });

  @observable isPinned = this.storage.get().pinnedSidebar;
  @observable isAccessible = true;
  @observable sidebarWidth = this.storage.get().sidebarWidth;

  @disposeOnUnmount syncPinnedStateWithStorage = reaction(
    () => this.isPinned,
    (isPinned) => this.storage.merge({ pinnedSidebar: isPinned })
  );

  @disposeOnUnmount syncWidthStateWithStorage = reaction(
    () => this.sidebarWidth,
    (sidebarWidth) => this.storage.merge({ sidebarWidth })
  );


  toggleSidebar = () => {
    this.isPinned = !this.isPinned;
    this.isAccessible = false;
    setTimeout(() => (this.isAccessible = true), 250);
  };

  getSidebarSize = () => {
    return {
      "--sidebar-width": `${this.sidebarWidth}px`,
    };
  };

  @autobind()
  adjustWidth(newWidth: number): void {
    this.sidebarWidth = newWidth;
  }

  render() {
    const { className, headerClass, footer, footerClass, children } = this.props;
    const cluster = getHostedCluster();

    if (!cluster) {
      return null; // fix: skip render when removing active (visible) cluster
    }

    return (
      <div className={cssNames("MainLayout", className)} style={this.getSidebarSize() as any}>
        <MainLayoutHeader className={headerClass} cluster={cluster} />

        <aside className={cssNames("flex column", { pinned: this.isPinned, accessible: this.isAccessible })}>
          <Sidebar className="box grow" isPinned={this.isPinned} toggle={this.toggleSidebar} />
          <ResizingAnchor
            direction={ResizeDirection.HORIZONTAL}
            placement={ResizeSide.TRAILING}
            growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
            getCurrentExtent={() => this.sidebarWidth}
            onDrag={this.adjustWidth}
            onDoubleClick={this.toggleSidebar}
            disabled={!this.isPinned}
            minExtent={120}
            maxExtent={400}
          />
        </aside>

        <main>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <footer className={footerClass}>{footer ?? <Dock />}</footer>
      </div>
    );
  }
}
