/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tab-layout.scss";

import type { ReactNode } from "react";
import React from "react";
import { matchPath, Redirect, Route, Switch } from "react-router";
import { observer } from "mobx-react";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { ErrorBoundary } from "../error-boundary";
import type { ObservableHistory } from "mobx-observable-history";
import { withInjectables } from "@ogre-tools/injectable-react";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";

export interface TabLayoutProps {
  className?: IClassName;
  contentClass?: IClassName;
  tabs?: TabLayoutRoute[];
  children?: ReactNode;
  scrollable?: boolean;
}

export interface TabLayoutRoute {
  routePath: string;
  title: React.ReactNode;
  component: React.ComponentType<any>;
  url?: string; // page-url, if not provided `routePath` is used (doesn't work when path has some :placeholder(s))
  exact?: boolean; // route-path matching rule
  default?: boolean; // initial tab to open with provided `url, by default tabs[0] is used
}

interface Dependencies {
  observableHistory: ObservableHistory<unknown>;
  navigate: Navigate;
}

const NonInjectedTabLayout = observer((props: TabLayoutProps & Dependencies) => {
  const {
    className,
    contentClass,
    tabs = [],
    scrollable,
    children,
    observableHistory,
    navigate,
  } = props;
  const currentLocation = observableHistory.location.pathname;
  const hasTabs = tabs.length > 0;
  const startTabUrl = hasTabs ? (tabs.find(tab => tab.default) || tabs[0])?.url : null;

  return (
    <div className={cssNames("TabLayout", className)}>
      {hasTabs && (
        <Tabs<string> center onChange={(url) => navigate(url)}>
          {tabs.map(({ title, routePath, url = routePath, exact }) => (
            <Tab
              key={url}
              label={title}
              value={url}
              active={!!matchPath(currentLocation, { path: routePath, exact })}
            />
          ))}
        </Tabs>
      )}
      <main className={cssNames(contentClass, { scrollable })}>
        <ErrorBoundary>
          {hasTabs && (
            <Switch>
              {tabs.map(({ routePath, exact, component }) => (
                <Route
                  key={routePath}
                  exact={exact}
                  path={routePath}
                  component={component}
                />
              ))}
              {startTabUrl && <Redirect to={startTabUrl}/>}
            </Switch>
          )}
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
});

export const TabLayout = withInjectables<Dependencies, TabLayoutProps>(NonInjectedTabLayout, {
  getProps: (di, props) => ({
    ...props,
    observableHistory: di.inject(observableHistoryInjectable),
    navigate: di.inject(navigateInjectable),
  }),
});
