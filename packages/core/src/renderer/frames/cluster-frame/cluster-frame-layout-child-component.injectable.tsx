/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterFrameChildComponentInjectionToken } from "./cluster-frame-child-component-injection-token";
import { MainLayout } from "../../components/layout/main-layout";
import { Sidebar } from "../../components/layout/sidebar";
import { Dock } from "../../components/dock";
import styles from "./cluster-frame.module.css";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import { Redirect } from "react-router";
import startUrlInjectable from "./start-url.injectable";
import currentPathInjectable from "../../routes/current-path.injectable";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";

interface Dependencies {
  currentRouteComponent: IComputedValue<React.ElementType<any> | undefined>;
  startUrl: IComputedValue<string>;
  currentPath: IComputedValue<string>;
}

const NonInjectedClusterFrameLayout = observer((props: Dependencies) => {
  const Component = props.currentRouteComponent.get();
  const starting = props.startUrl.get();
  const current = props.currentPath.get();

  return (
    <MainLayout sidebar={<Sidebar />} footer={<Dock />}>
      {Component ? (
        <Component />
      ) : // NOTE: this check is to prevent an infinite loop
        starting !== current ? (
          <Redirect to={starting} />
        ) : (
          <div className={styles.centering}>
            <div className="error">
              An error has occurred. No route can be found matching the
              current route, which is also the starting route.
            </div>
          </div>
        )}
    </MainLayout>
  );
});

const ClusterFrameLayout = withInjectables<Dependencies>(NonInjectedClusterFrameLayout, {
  getProps: (di, props) => ({
    ...props,
    currentRouteComponent: di.inject(currentRouteComponentInjectable),
    startUrl: di.inject(startUrlInjectable),
    currentPath: di.inject(currentPathInjectable),
  }),
});

const clusterFrameLayoutChildComponentInjectable = getInjectable({
  id: "cluster-frame-layout-child-component",

  instantiate: () => ({
    id: "cluster-frame-layout",
    shouldRender: computed(() => true),
    Component: ClusterFrameLayout,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default clusterFrameLayoutChildComponentInjectable;
