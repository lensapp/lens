import "./tab-layout.scss";
import React, { ReactNode } from "react";
import { matchPath, RouteProps } from "react-router-dom";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { ErrorBoundary } from "../error-boundary";
import { navigate, navigation } from "../../navigation";

export interface TabRoute extends RouteProps {
  title: React.ReactNode;
  url: string;
}

export interface TabLayoutProps {
  children: ReactNode;
  className?: any;
  tabs?: TabRoute[];
  contentClass?: string;
}

export const TabLayout = observer(({ className, contentClass, tabs, children }: TabLayoutProps) => {
  const routePath = navigation.location.pathname;
  return (
    <div className={cssNames("TabLayout", className)}>
      {tabs && (
        <Tabs center onChange={(url) => navigate(url)}>
          {tabs.map(({ title, path, url, ...routeProps }) => {
            const isActive = !!matchPath(routePath, { path, ...routeProps });
            return <Tab key={url} label={title} value={url} active={isActive}/>;
          })}
        </Tabs>
      )}
      <main className={contentClass}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
});
