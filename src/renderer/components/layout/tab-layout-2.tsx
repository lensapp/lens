/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tab-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Tab, Tabs } from "../tabs";
import { ErrorBoundary } from "../error-boundary";
import type { HierarchicalSidebarItem } from "./sidebar-items.injectable";

export interface TabLayoutProps {
  tabs?: HierarchicalSidebarItem[];
  children?: React.ReactNode;
}

export const TabLayout = observer(
  ({
    tabs = [],
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
            {tabs.map(({ registration, isActive }) => {
              const active = isActive.get();

              return (
                <Tab
                  onClick={registration.onClick}
                  key={registration.id}
                  label={registration.title}
                  active={active}
                  data-is-active-test={active}
                  data-testid={`tab-link-for-${registration.id}`}
                  value={undefined}
                />
              );
            })}
          </Tabs>
        )}

        <main>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    );
  },
);
