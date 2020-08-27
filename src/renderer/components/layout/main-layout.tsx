import "./main-layout.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { matchPath, RouteProps } from "react-router-dom";
import { createStorage, cssNames } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { Sidebar } from "./sidebar";
import { ErrorBoundary } from "../error-boundary";
import { Dock } from "../dock";
import { navigate, navigation } from "../../navigation";
import { getHostedCluster } from "../../../common/cluster-store";

export interface TabRoute extends RouteProps {
  title: React.ReactNode;
  url: string;
}

interface Props {
  className?: any;
  tabs?: TabRoute[];
  footer?: React.ReactNode;
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
}

@observer
export class MainLayout extends React.Component<Props> {
  public storage = createStorage("main_layout", { pinnedSidebar: true });

  @observable isPinned = this.storage.get().pinnedSidebar;
  @observable isAccessible = true;

  @disposeOnUnmount syncPinnedStateWithStorage = reaction(
    () => this.isPinned,
    isPinned => this.storage.merge({ pinnedSidebar: isPinned })
  );

  toggleSidebar = () => {
    this.isPinned = !this.isPinned;
    this.isAccessible = false;
    setTimeout(() => this.isAccessible = true, 250);
  }

  render() {
    const { className, contentClass, headerClass, tabs, footer, footerClass, children } = this.props;
    const routePath = navigation.location.pathname;
    const cluster = getHostedCluster();
    if (!cluster) {
      return null; // fix: skip render when removing active (visible) cluster
    }
    return (
      <div className={cssNames("MainLayout", className)}>
        <header className={cssNames("flex gaps align-center", headerClass)}>
          <span className="cluster">
            {cluster.preferences.clusterName || cluster.contextName}
          </span>
        </header>

        <aside className={cssNames("flex column", { pinned: this.isPinned, accessible: this.isAccessible })}>
          <Sidebar
            className="box grow"
            isPinned={this.isPinned}
            toggle={this.toggleSidebar}
          />
        </aside>

        {tabs && (
          <Tabs center onChange={url => navigate(url)}>
            {tabs.map(({ title, path, url, ...routeProps }) => {
              const isActive = !!matchPath(routePath, { path, ...routeProps });
              return <Tab key={url} label={title} value={url} active={isActive}/>
            })}
          </Tabs>
        )}

        <main className={contentClass}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        <footer className={footerClass}>
          {footer === undefined ? <Dock/> : footer}
        </footer>
      </div>
    );
  }
}
