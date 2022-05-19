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
import { withInjectables } from "@ogre-tools/injectable-react";
import captureWithIdInjectable from "../../telemetry/capture-with-id.injectable";

interface Dependencies {
  captureClick: (id: string, action: string) => void;
}
export interface TabLayoutProps {
  tabs?: HierarchicalSidebarItem[];
  children?: React.ReactNode;
}

const NonInjectedTabLayout = observer(
  ({
    tabs = [],
    children,
    captureClick,
  }: TabLayoutProps & Dependencies) => {
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
                  onClick={() => {
                    if (registration.title) {
                      captureClick(registration.title.toString(), "Tab Click");
                    }
                    registration.onClick();
                  }}
                  key={registration.id}
                  label={registration.title}
                  active={active}
                  data-is-active-test={active}
                  data-testid={`tab-link-for-${registration.id}`}
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

export const TabLayout = withInjectables<Dependencies, TabLayoutProps>(
  NonInjectedTabLayout,

  {
    getProps: (di, props) => ({
      captureClick: di.inject(captureWithIdInjectable),
      ...props,
    }),
  },
);
