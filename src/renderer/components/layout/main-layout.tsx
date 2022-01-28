/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./main-layout.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames, StorageLayer } from "../../utils";
import { ErrorBoundary } from "../error-boundary";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "../resizing-anchor";
import sidebarStorageInjectable, { defaultSidebarWidth, SidebarStorageState } from "./sidebar-storage.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";

export interface MainLayoutProps {
  sidebar: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  children?: React.ReactChild | React.ReactChild[];
}

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
}

const NonInjectedMainLayout = observer(({ sidebarStorage, sidebar, className, footer, children }: Dependencies & MainLayoutProps) => {
  const onSidebarResize = (width: number) => {
    sidebarStorage.merge({ width });
  };

  const { width: sidebarWidth } = sidebarStorage.get();
  const style = { "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties;

  return (
    <div className={cssNames(styles.mainLayout, className)} style={style}>
      <div className={styles.sidebar}>
        {sidebar}
        <ResizingAnchor
          direction={ResizeDirection.HORIZONTAL}
          placement={ResizeSide.TRAILING}
          growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
          getCurrentExtent={() => sidebarWidth}
          onDrag={onSidebarResize}
          onDoubleClick={() => onSidebarResize(defaultSidebarWidth)}
          minExtent={120}
          maxExtent={400}
        />
      </div>

      <div className={styles.contents}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      <div className={styles.footer}>{footer}</div>
    </div>
  );
});

/**
 * Main layout is commonly used as a wrapper for "global pages"
 *
 * @link https://api-docs.k8slens.dev/master/extensions/capabilities/common-capabilities/#global-pages
 */
export const MainLayout = withInjectables<Dependencies, MainLayoutProps>(NonInjectedMainLayout, {
  getProps: (di, props) => ({
    sidebarStorage: di.inject(sidebarStorageInjectable),
    ...props,
  }),
});
