/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { injectSystemCAs } from "../../../common/system-ca";
import React from "react";
import { observer } from "mobx-react";
import { ClusterManager } from "../../components/cluster-manager";
import { ErrorBoundary } from "../../components/error-boundary";
import { Notifications } from "../../components/notifications";
import { ConfirmDialog } from "../../components/confirm-dialog";
import { CommandContainer } from "../../components/command-palette/command-container";
import { withInjectables } from "@ogre-tools/injectable-react";
import broadcastThatRootFrameIsRenderedInjectable from "./broadcast-that-root-frame-is-rendered.injectable";

// Todo: remove import-time side-effect.
injectSystemCAs();

interface Dependencies {
  broadcastThatRootFrameIsRendered: () => void;
}

@observer
class NonInjectedRootFrame extends React.Component<Dependencies> {
  static displayName = "RootFrame";

  componentDidMount() {
    this.props.broadcastThatRootFrameIsRendered();
  }

  render() {
    return (
      <>
        <ErrorBoundary>
          <ClusterManager />
        </ErrorBoundary>
        <Notifications />
        <ConfirmDialog />
        <CommandContainer />
      </>
    );
  }
}

export const RootFrame = withInjectables<Dependencies>(
  NonInjectedRootFrame,

  {
    getProps: (di, props) => ({
      broadcastThatRootFrameIsRendered: di.inject(broadcastThatRootFrameIsRenderedInjectable),
      ...props,
    }),
  },
);
