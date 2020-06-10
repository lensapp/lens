import "./main-layout.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { matchPath, RouteProps } from "react-router-dom";
import { createStorage, cssNames } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { Sidebar } from "./sidebar";
import { configStore } from "../../config.store";
import { ErrorBoundary } from "../error-boundary";
import { Dock } from "../dock";
import { navigate, navigation } from "../../navigation";
import { themeStore } from "../../theme.store";

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
    const { clusterName } = configStore.config;
    const { pathname } = navigation.location;
    return (
      <div className={cssNames("MainLayout", className, themeStore.activeTheme.type)}>
        <header className={cssNames("flex gaps align-center", headerClass)}>
          <div className="box grow flex align-center">
            {clusterName && <span>{clusterName}</span>}
          </div>
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
              const isActive = !!matchPath(pathname, { path, ...routeProps });
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
