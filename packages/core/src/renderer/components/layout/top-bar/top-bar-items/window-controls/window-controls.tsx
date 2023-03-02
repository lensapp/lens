/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { cssNames } from "@k8slens/utilities";
import styles from "../../top-bar.module.scss";
import isLinuxInjectable from "../../../../../../common/vars/is-linux.injectable";
import toggleMaximizeWindowInjectable from "../../toggle-maximize-window/toggle-maximize-window.injectable";
import closeWindowInjectable from "./close-window/close-window.injectable";
import maximizeWindowInjectable from "./maximize-window/maximize-window.injectable";

interface Dependencies {
  isLinux: boolean;
  toggleMaximizeWindow: () => void;
  closeWindow: () => void;
  minimizeWindow: () => void;
}

const NonInjectedWindowControls = ({
  isLinux,
  toggleMaximizeWindow,
  closeWindow,
  minimizeWindow,
}: Dependencies) => (
  <div
    className={cssNames(styles.windowButtons, {
      [styles.linuxButtons]: isLinux,
    })}
  >
    <div
      className={styles.minimize}
      data-testid="window-minimize"
      onClick={minimizeWindow}
    >
      <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
        <rect
          fill="currentColor"
          width="10"
          height="1"
          x="1"
          y="9" />
      </svg>
    </div>

    <div
      className={styles.maximize}
      data-testid="window-maximize"
      onClick={toggleMaximizeWindow}
    >
      <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
        <rect
          width="9"
          height="9"
          x="1.5"
          y="1.5"
          fill="none"
          stroke="currentColor"
        />
      </svg>
    </div>

    <div
      className={styles.close}
      data-testid="window-close"
      onClick={closeWindow}
    >
      <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
        <polygon
          fill="currentColor"
          points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
        />
      </svg>
    </div>
  </div>
);

export const WindowControls = withInjectables<Dependencies>(
  NonInjectedWindowControls,

  {
    getProps: (di) => ({
      isLinux: di.inject(isLinuxInjectable),
      toggleMaximizeWindow: di.inject(toggleMaximizeWindowInjectable),
      closeWindow: di.inject(closeWindowInjectable),
      minimizeWindow: di.inject(maximizeWindowInjectable),
    }),
  },
);
