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
import { computed } from "mobx";
import currentRouteComponentInjectable from "../../routes/current-route-component.injectable";
import { Redirect } from "react-router";
import startUrlInjectable from "./start-url.injectable";
import currentPathInjectable from "../../routes/current-path.injectable";
import { observer } from "mobx-react";

const clusterFrameLayoutChildComponentInjectable = getInjectable({
  id: "cluster-frame-layout-child-component",

  instantiate: (di) => {
    const currentRouteComponent = di.inject(currentRouteComponentInjectable);
    const startUrl = di.inject(startUrlInjectable);
    const currentPath = di.inject(currentPathInjectable);

    return {
      id: "cluster-frame-layout",

      shouldRender: computed(() => true),

      Component: observer(() => {
        const Component = currentRouteComponent.get();
        const starting = startUrl.get();
        const current = currentPath.get();

        return (
          <MainLayout sidebar={<Sidebar />} footer={<Dock />}>
            {Component ? (
              <Component />
            ) : // NOTE: this check is to prevent an infinite loop
              starting !== current ? (
                <Redirect to={startUrl.get()} />
              ) : (
                <div className={styles.centering}>
                  <div className="error">
                    An error has occured. No route can be found matching the
                    current route, which is also the starting route.
                  </div>
                </div>
              )}
          </MainLayout>
        );
      }),
    };
  },

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default clusterFrameLayoutChildComponentInjectable;
