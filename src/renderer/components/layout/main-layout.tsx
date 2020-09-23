import "./main-layout.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { createStorage, cssNames } from "../../utils";
import { Sidebar } from "./sidebar";
import { ErrorBoundary } from "../error-boundary";
import { Dock } from "../dock";
import { getHostedCluster } from "../../../common/cluster-store";

export interface MainLayoutProps {
  className?: any;
  footer?: React.ReactNode;
  headerClass?: string;
  footerClass?: string;
}

@observer
export class MainLayout extends React.Component<MainLayoutProps> {
  public storage = createStorage("main_layout", { pinnedSidebar: true });

  @observable isPinned = this.storage.get().pinnedSidebar;
  @observable isAccessible = true;

  @disposeOnUnmount syncPinnedStateWithStorage = reaction(
    () => this.isPinned,
    (isPinned) => this.storage.merge({ pinnedSidebar: isPinned })
  );

  toggleSidebar = () => {
    this.isPinned = !this.isPinned;
    this.isAccessible = false;
    setTimeout(() => (this.isAccessible = true), 250);
  };

  render() {
    const { className, headerClass, footer, footerClass, children } = this.props;
    const cluster = getHostedCluster();
    if (!cluster) {
      return null; // fix: skip render when removing active (visible) cluster
    }
    return (
      <div className={cssNames("MainLayout", className)}>
        <header className={cssNames("flex gaps align-center", headerClass)}>
          <span className="cluster">{cluster.preferences.clusterName || cluster.contextName}</span>
        </header>

        <aside className={cssNames("flex column", { pinned: this.isPinned, accessible: this.isAccessible })}>
          <Sidebar className="box grow" isPinned={this.isPinned} toggle={this.toggleSidebar} />
        </aside>

        <main>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <footer className={footerClass}>{footer === undefined ? <Dock /> : footer}</footer>
      </div>
    );
  }
}
