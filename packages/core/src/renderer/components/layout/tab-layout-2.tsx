/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tab-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { Tab, Tabs } from "../tabs";
import { ErrorBoundary } from "@k8slens/error-boundary";
import type { SidebarItemDeclaration } from "@k8slens/cluster-sidebar";

export interface TabLayoutProps {
  tabs?: SidebarItemDeclaration[];
  children?: StrictReactNode;
  scrollable?: boolean;
}

export const TabLayout = observer(
  ({
    tabs = [],
    scrollable,
    children,
  }: TabLayoutProps) => {
    const hasTabs = tabs.length > 0;

    return (
      <div
        className={cssNames("TabLayout")}
        data-testid="tab-layout"
      >

        {hasTabs && (
          <Tabs center>
            {tabs.map(({ onClick, id, title, isActive }) => (
              <Tab
                onClick={onClick}
                key={id}
                label={title}
                active={isActive.get()}
                data-is-active-test={isActive.get()}
                data-testid={`tab-link-for-${id}`}
                value={undefined}
              />
            ))}
          </Tabs>
        )}

        <main className={cssNames({ scrollable })}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    );
  },
);
